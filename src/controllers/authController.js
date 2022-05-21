// @ts-nocheck
const bcrypt = require('bcryptjs');
const { Role } = require('@prisma/client');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const { prepareResponse } = require('../CONST/response');
const { isEmailExist } = require('../services/UserService');
const { sendConfirmEmail } = require('../helpers/emailHandler');
const { confirmEmail } = require('../CONST/emailTemplate');
const { models } = require('../db');
const { createOne } = require('../helpers/resourceLoader');

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

    const user = await models.user.findFirst({
      where: { _id: verifiedToken.id, roles: Role.ADMIN },
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
    const userCredential = await models.user.findFirst({
      where: {
        email,
      },
      select: {
        id: true,
        name: true,
        roles: true,
        password: true,
        active: true,
      },
    });

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
      { id: userCredential._id, roles: userCredential.roles },
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
    const accessToken = jwt.sign(
      { email },
      process.env.CONFIRM_EMAIL_TOKEN_SECRET,
      {
        expiresIn: process.env.REFRESH_TOKEN_EXP,
      },
    );

    const [newUser] = await models.$transaction([
      createOne('user', {
        name,
        email,
        password: hashedPassword,
      }),
      sendConfirmEmail({
        from: 'GIT Club',
        to: email,
        subject: 'GIT Club - Please confirm your email address',
        html: confirmEmail(
          `${process.env.CLIENT_URL}${process.env.CONFIRM_EMAIL_PATH}/?token=${accessToken}`,
          name,
        ),
      }),
    ]);

    return prepareResponse(res, 201, 'Signup User Successfully', { newUser });
  } catch (error) {
    return prepareResponse(res, 400, 'Signup User Failed');
  }
};

/**
 * It takes a token from the request body, verifies it, and then updates the user's active status to
 * true
 * @param req - The request object.
 * @param res - the response object
 */
const activeUser = async (req, res) => {
  const { token } = req.body;

  try {
    const verifiedToken = await jwt.verify(
      token,
      process.env.CONFIRM_EMAIL_TOKEN_SECRET,
    );
    const userActivated = await models.user.update({
      where: { email: verifiedToken.email },
      data: { $set: { active: true } },
    });

    return prepareResponse(res, 201, 'Active User Successfully', {
      userActivated,
    });
  } catch (error) {
    return prepareResponse(res, 400, 'Active user failed');
  }
};

module.exports = {
  login,
  signup,
  verifyToken,
  isAdmin,
  activeUser,
};
