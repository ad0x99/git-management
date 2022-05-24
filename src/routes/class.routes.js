const express = require('express');
const { body } = require('express-validator');
const {
  getAllClass,
  createNewClass,
  updateClass,
  deleteClass,
} = require('../controllers/classControllers');
const { isAuthenticated, isAdminPermission } = require('../middleware/auth');
const { upload } = require('../utils/upload');

const classRouter = express.Router();

// Class routes
classRouter.get('/class', isAuthenticated, isAdminPermission, getAllClass);
classRouter.post(
  '/class',
  isAuthenticated,
  isAdminPermission,
  upload.single('file'),
  body('host').notEmpty().isUUID().isLength({ min: 5 }),
  body('className').notEmpty().isLength({ min: 5 }),
  body('subject').notEmpty().isLength({ min: 5 }),
  body('startDate').notEmpty().isDate(),
  body('endDate').notEmpty().isDate(),
  createNewClass,
);

classRouter.put(
  '/class/:id',
  isAuthenticated,
  isAdminPermission,
  upload.single('file'),
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
