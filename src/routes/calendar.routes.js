const express = require('express');
const { isAuthenticated } = require('../middleware/auth');
const {
  getAllCalendar,
  getOneCalendar,
  createCalendar,
  deleteCalendar,
} = require('../controllers/calendarController');
const { body } = require('express-validator');

const calendarRouter = express.Router();

calendarRouter.get('/calendar', isAuthenticated, getAllCalendar);
calendarRouter.get('/calendar/:id', isAuthenticated, getOneCalendar);
calendarRouter.post(
  '/calendar',
  isAuthenticated,
  body('classId').notEmpty().isUUID().isLength({ min: 5 }),
  body('studyDate').notEmpty().isDate(),
  createCalendar,
);

calendarRouter.delete('/calendar/:id', isAuthenticated, deleteCalendar);
