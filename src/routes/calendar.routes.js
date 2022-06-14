const express = require('express');
const { body } = require('express-validator');
const { isAuthenticated, isAdminPermission } = require('../middleware/auth');
const {
  getAllCalendar,
  getOneCalendar,
  createCalendar,
  deleteCalendar,
} = require('../controllers/calendarController');

const calendarRouter = express.Router();

calendarRouter.get(
  '/calendar',
  isAuthenticated,
  isAdminPermission,
  getAllCalendar,
);
calendarRouter.get('/calendar/:id', isAuthenticated, getOneCalendar);

calendarRouter.post(
  '/calendar',
  isAuthenticated,
  body('classId').notEmpty().isUUID(),
  body('studyDate').notEmpty().isDate(),
  createCalendar,
);

calendarRouter.delete('/calendar/:id', isAuthenticated, deleteCalendar);

module.exports = { calendarRouter };
