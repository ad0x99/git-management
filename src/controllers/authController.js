const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const { prepareResponse } = require('../CONST/response');
const { User } = require('../models/Users');
const { isEmailExist } = require('../services/UserService');

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return prepareResponse(res, 406, 'Please provide email and password!');
  }

  try {
    const userCredential = await User.findOne(
      {
        email,
      },
      {
        _id: 1,
        name: 1,
        password: 1,
      },
    );

    if (!userCredential) {
      return prepareResponse(res, 404, 'Could not found email');
    }

    const isValidPassword = await bcrypt.compare(
      password,
      userCredential.password,
    );
    if (!isValidPassword) {
      return prepareResponse(res, 404, 'Your email or password is incorrect');
    }

    const token = await jwt.sign(
      { id: userCredential._id },
      process.env.SECRET_TOKEN,
      {
        expiresIn: '24h',
      },
    );

    return prepareResponse(res, 200, `Hello ${userCredential.name}`, {
      email,
      token,
    });
  } catch (error) {
    return prepareResponse(res, 401, 'Login Failed');
  }
};

const signup = async (req, res) => {
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

module.exports = { login, signup };
