const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const { prepareResponse } = require('../CONST/response');
const { User } = require('../models/Users');
const { isEmailExist } = require('../services/UserService');

const createUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (await isEmailExist(email)) {
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

    return prepareResponse(res, 201, 'Created New User Successfully', newUser);
  } catch (error) {
    return prepareResponse(res, 400, 'Create New User Failed');
  }
};

const getAllUsers = async (req, res) => {
  const { page, size } = req.query;

  const pageSize = parseInt(size, 10);
  const currentPage = parseInt(page, 10);

  try {
    const allUsers = await User.find({
      limit: pageSize,
      offset: (currentPage - 1) * pageSize,
    });
    const count = allUsers.length;

    return prepareResponse(res, 200, 'Get all users successfully', {
      count,
      allUsers,
    });
  } catch (error) {
    return prepareResponse(res, 404, 'Users Not Found');
  }
};

module.exports = { createUser, getAllUsers };
