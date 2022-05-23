const express = require('express');
const { body } = require('express-validator');
const {
  getAllClass,
  createNewClass,
  updateClass,
  deleteClass,
} = require('../controllers/classControllers');
const { isAuthenticated, isAdminPermission } = require('../middleware/auth');

const classRouter = express.Router();

// Class routes
classRouter.get('/class', isAuthenticated, isAdminPermission, getAllClass);
classRouter.post(
  '/class',
  isAuthenticated,
  isAdminPermission,
  body('host').notEmpty().isUUID().isLength({ min: 5 }),
  body('className').notEmpty().isLength({ min: 5 }),
  body('startDate').notEmpty().isDate(),
  body('endDate').notEmpty().isDate(),
  createNewClass,
);

classRouter.put(
  '/class/:id',
  isAuthenticated,
  isAdminPermission,
  body('className').notEmpty().isLength({ min: 5 }),
  body('startDate').notEmpty().isDate(),
  body('endDate').notEmpty().isDate(),
  updateClass,
);
classRouter.delete(
  '/class/:id',
  isAuthenticated,
  isAdminPermission,
  deleteClass,
);

module.exports = { classRouter };
