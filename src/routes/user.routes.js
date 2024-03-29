const express = require('express');
const { body } = require('express-validator');
const multer = require('multer');
const { prepareResponse } = require('../CONST/response');
const { login, signup, activeUser } = require('../controllers/authController');
const {
  createUser,
  getAllUsers,
  updateUserInfo,
  deleteUser,
} = require('../controllers/userControllers');
const { isAuthenticated, isAdminPermission } = require('../middleware/auth');

const userRouter = express.Router();

// User routes
userRouter.get('/users', isAuthenticated, isAdminPermission, getAllUsers);
userRouter.post(
  '/users',
  isAuthenticated,
  isAdminPermission,
  body('email').notEmpty().isEmail(),
  body('password').notEmpty().isLength({ min: 6 }),
  createUser,
);
userRouter.put(
  '/users/:id',
  isAuthenticated,
  isAdminPermission,
  body('email').isEmail(),
  updateUserInfo,
);
userRouter.delete('/users/:id', isAuthenticated, isAdminPermission, deleteUser);

// Auth routes
userRouter.post(
  '/login',
  body('email').notEmpty().isEmail(),
  body('password').notEmpty(),
  login,
);
userRouter.post(
  '/signup',
  body('name').notEmpty().isLength({ min: 5, max: 256 }),
  body('email').notEmpty().isEmail(),
  body('password').notEmpty().isLength({ min: 6, max: 256 }),
  signup,
);
userRouter.post('/active', body('token').notEmpty().isJWT(), activeUser);

module.exports = { userRouter };
