const express = require('express');
const { body } = require('express-validator');
const {
  checkAttendedOrAbsent,
  checkAttendanceMany,
  getAllAttendances,
} = require('../controllers/attendanceController');
const { isAuthenticated } = require('../middleware/auth');

const attendanceRouter = express.Router();

attendanceRouter.get('/attendances', isAuthenticated, getAllAttendances);

attendanceRouter.post(
  '/check-attendance/:idUserAttendance',
  isAuthenticated,
  body('isAttendance').notEmpty().isBoolean(),
  checkAttendedOrAbsent,
);

attendanceRouter.post(
  '/check-attendance-many/:idClassCalendar',
  isAuthenticated,
  body('isAttendanceArray').notEmpty().isArray(),
  checkAttendanceMany,
);

module.exports = { attendanceRouter };
