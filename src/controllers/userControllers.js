const { User } = require('../models/Users');
const { isEmailExist } = require('../services/UserService');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

const createUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (await isEmailExist(email)) {
      return res.status(409).json({
        message:
          'Email is already used by another account. Please use a new email',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: 'Created New User Successfully',
      newUser,
    });
  } catch (error) {
    return res.status(400).json({ message: 'Create New User Failed' });
  }
};

const getAllUsers = async (req, res) => {
  const { page, size } = req.query;

  const pageSize = parseInt(size);
  const currentPage = parseInt(page);

  try {
    // Get all users
    const allUsers = await User.find({
      limit: pageSize,
      offset: (currentPage - 1) * pageSize,
    });

    // Count number of users
    let count = allUsers.length;

    return res.status(200).json({ count, allUsers });
  } catch (error) {
    return res.status(404).json({ message: 'Users Not Found' });
  }
};

module.exports = { createUser, getAllUsers };
