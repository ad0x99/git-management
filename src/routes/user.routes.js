const express = require('express');
const { body } = require('express-validator');
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

module.exports = router;
