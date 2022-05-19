const express = require('express');
const { body } = require('express-validator');
const { login, signup } = require('../controllers/authController');
const { createUser, getAllUsers } = require('../controllers/userControllers');

const router = express.Router();

// User routes
router.get('/users', getAllUsers);
router.post(
  '/users',
  body('email').notEmpty().isEmail(),
  body('password').notEmpty().isLength({ min: 6 }),
  createUser,
);

// Auth routes
router.post(
  '/login',
  body('email').notEmpty().isEmail(),
  body('password').notEmpty(),
  login,
);
router.post(
  '/signup',
  body('email').notEmpty().isEmail(),
  body('password').notEmpty().isLength({ min: 6 }),
  signup,
);

module.exports = router;
