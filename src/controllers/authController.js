// @ts-nocheck
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const { User, USER_ROLES } = require('../models/Users');
const { prepareResponse } = require('../CONST/response');
const { isEmailExist } = require('../services/UserService');

/**
 * It checks if the user is an admin
 * @param req - The request object
 * @param res - The response object
 * @returns A function that takes in a request and a response object.
 */
const isAdmin = async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const verifiedToken = jwt.verify(token, process.env.SECRET_TOKEN);

    const user = await User.findOne({
      _id: verifiedToken.id,
      role: USER_ROLES.ADMIN,
    });

    if (user) {
      return true;
    }

    return false;
  } catch (error) {
    return prepareResponse(res, 404, 'Get User Context Failed');
  }
};

/**
 * It checks if the user is authenticated and if the user is an admin
 * @param req - The request object.
 * @param res - The response object
 * @param next - This is a callback function that is called when the middleware is done.
 * @returns A function that is being exported.
 */
const isAdminPermission = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const verifiedToken = jwt.verify(token, process.env.SECRET_TOKEN);

      const user = await User.findOne({
        _id: verifiedToken.id,
        role: USER_ROLES.ADMIN,
        active: true,
      });

      if (!user) {
        return prepareResponse(
          res,
          403,
          'You dont have permission to this resource',
        );
      }

      next();
    } catch (error) {
      return prepareResponse(res, 401, 'Not authorized, token failed');
    }
  }

  if (!token) {
    return prepareResponse(res, 401, 'Not authorized, token in missing');
  }
};

/**
 * It checks if the user is authenticated
 * @param req - The request object
 * @param res - The response object
 * @param next - This is a callback function that is called when the middleware is done.
 * @returns A function that is being exported.
 */
const isAuthenticated = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const verifiedToken = jwt.verify(token, process.env.SECRET_TOKEN);

      const user = await User.findOne({
        _id: verifiedToken.id,
        active: true,
      });

      if (!user) {
        return prepareResponse(res, 403, 'Access denied!');
      }

      req.user = user;
      next();
    } catch (error) {
      return prepareResponse(res, 401, 'Not authorized, token failed');
    }
  }

  if (!token) {
    return prepareResponse(res, 401, 'Not authorized, token in missing');
  }
};

/**
 * Verify token from request headers
 * @param req - The request object
 * @param res - The response object
 * @param next - This is a function that is called when the middleware is complete.
 * @returns A function that takes in three parameters: req, res, and next.
 */
const verifyToken = async (req, res, next) => {
  try {
    const token = req.header('jwt');

    if (!token) {
      return prepareResponse(res, 403, 'Access Denied');
    }

    const verifiedToken = await jwt.verify(token, process.env.SECRET_TOKEN);
    req.user = verifiedToken;
    next();
  } catch (error) {
    return prepareResponse(res, 401, 'Invalid Token');
  }
};

/**
 * Login function
 * the user
 * @param req - The request object.
 * @param res - The response object.
 */
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
        role: 1,
        password: 1,
        active: 1,
      },
    );

    if (!userCredential) {
      return prepareResponse(res, 404, 'Could not found email');
    }

    if (!userCredential.active) {
      return prepareResponse(res, 403, 'Your account is inactive');
    }

    const isValidPassword = await bcrypt.compare(
      password,
      userCredential.password,
    );
    if (!isValidPassword) {
      return prepareResponse(res, 404, 'Your email or password is incorrect');
    }

    const token = await jwt.sign(
      { id: userCredential._id, role: userCredential.role },
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

/**
 * It creates a new user account
 * @param req - The request object.
 * @param res - The response object.
 */
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

module.exports = {
  login,
  signup,
  verifyToken,
  isAdminPermission,
  isAdmin,
  isAuthenticated,
};
