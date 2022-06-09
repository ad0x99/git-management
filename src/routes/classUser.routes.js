const express = require('express');
const {
  getAllClassUser,
  getOneClassUser,
} = require('../controllers/classUserControllers');
const { isAuthenticated, isAdminPermission } = require('../middleware/auth');

const classUserRouter = express.Router();

classUserRouter.get(
  '/class-user',
  isAuthenticated,
  isAdminPermission,
  getAllClassUser,
);
classUserRouter.get('/class-user/:id', isAuthenticated, getOneClassUser);

module.exports = { classUserRouter };
