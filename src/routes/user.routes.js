const express = require('express');
const { createUser } = require('../controllers/userControllers');
const { body } = require('express-validator');

const router = express.Router();

// User routes
router.post(
  '/users',
  body('email').isEmpty().isEmail(),
  body('password').isEmpty().isLength({ min: 8 }),
  createUser
);

module.exports = router;
