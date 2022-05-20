const express = require('express');
const { body } = require('express-validator');
const {
  login,
  signup,
  isAdminPermission,
  isAuthenticated,
  activeUser,
} = require('../controllers/authController');
const {
  createUser,
  getAllUsers,
  updateUserInfo,
  deleteUser,
} = require('../controllers/userControllers');

const router = express.Router();

// User routes
router.get('/users', isAuthenticated, isAdminPermission, getAllUsers);
router.post(
  '/users',
  isAuthenticated,
  isAdminPermission,
  body('email').notEmpty().isEmail(),
  body('password').notEmpty().isLength({ min: 6 }),
  createUser,
);
router.put(
  '/users/:id',
  isAuthenticated,
  isAdminPermission,
  body('email').isEmail(),
  updateUserInfo,
);
router.delete('/users/:id', isAuthenticated, isAdminPermission, deleteUser);

// Auth routes
router.post(
  '/login',
  body('email').notEmpty().isEmail(),
  body('password').notEmpty(),
  login,
);
router.post(
  '/signup',
  body('name').notEmpty().isLength({ min: 5, max: 256 }),
  body('email').notEmpty().isEmail(),
  body('password').notEmpty().isLength({ min: 6, max: 256 }),
  signup,
);
router.post('/active', body('token').notEmpty().isJWT(), activeUser);

module.exports = router;
