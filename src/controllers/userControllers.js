const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const { prepareResponse } = require('../CONST/response');
const { User, USER_ROLES } = require('../models/Users');
const { isEmailExist } = require('../services/UserService');
const { isAdmin } = require('./authController');

/**
 * It gets all users from the database and returns them to the user
 * @param req - The request object.
 * @param res - The response object.
 * @returns An object with a status code, message and data.
 */
const getAllUsers = async (req, res) => {
  const { page, size } = req.query;

  const pageSize = parseInt(size, 10);
  const currentPage = parseInt(page, 10);

  try {
    const conditions = {
      limit: pageSize,
      offset: (currentPage - 1) * pageSize,
    };
    const isAdminRole = await isAdmin(req, res);
    const allUsers = await User.find(conditions);
    const count = allUsers.length;

    if (!isAdminRole) {
      conditions.role = { $ne: USER_ROLES.ADMIN };
    }

    return prepareResponse(res, 200, 'Get all users successfully', {
      count,
      allUsers,
    });
  } catch (error) {
    return prepareResponse(res, 404, 'Users Not Found');
  }
};

/**
 * It creates a new user
 * @param req - The request object.
 * @param res - The response object.
 */
const createUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const isEmailExisted = await isEmailExist(email);
    if (isEmailExisted) {
      return prepareResponse(
        res,
        409,
        'Email is already used by another account. Please use a new email',
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return prepareResponse(res, 201, 'Created New User Successfully', {
      newUser,
    });
  } catch (error) {
    return prepareResponse(res, 400, 'Create New User Failed');
  }
};

/**
 * This function will update the user's information
 * @param req - The request object.
 * @param res - The response object.
 */
const updateUserInfo = async (req, res) => {
  const { name, email } = req.body;
  const { id } = req.params;
  let params = {};

  try {
    const user = await User.findById(id);
    const isAdminRole = await isAdmin(req, res);

    if (!user) {
      return prepareResponse(res, 404, 'User not exists');
    }

    if (email && (await isEmailExist(email))) {
      return prepareResponse(
        res,
        409,
        'Email is already used by another account. Please use another email',
      );
    }

    if (isAdminRole) {
      params = { name };
    } else {
      params = { ...req.body };
    }

    const userInfo = await User.findOneAndUpdate({ ...params });
    return prepareResponse(res, 201, 'Update User Info Successfully', {
      userInfo,
    });
  } catch (error) {
    return prepareResponse(res, 400, 'Create New User Failed');
  }
};

/**
 * It deletes a user from the database
 * @param req - The request object.
 * @param res - The response object.
 */
const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);

    if (!user) {
      return prepareResponse(res, 404, 'User not exists');
    }

    await User.deleteOne({ _id: id });
    return prepareResponse(res, 201, 'User is deleted');
  } catch (error) {
    return prepareResponse(res, 400, 'Delete User Failed');
  }
};

module.exports = { createUser, getAllUsers, updateUserInfo, deleteUser };
