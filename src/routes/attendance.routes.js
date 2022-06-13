const express = require('express');
const { body } = require('express-validator');
const {
  checkAttendedOrAbsent,
  checkAttendanceManyUsers,
  getAllAttendances,
} = require('../controllers/attendanceController');
const { isAuthenticated, isAdminPermission } = require('../middleware/auth');

const attendanceRouter = express.Router();

attendanceRouter.get('/attendances', isAuthenticated, getAllAttendances);

attendanceRouter.post(
  '/attendances/user/:userAttendanceId',
  isAuthenticated,
  isAdminPermission,
  body('isAttendance').notEmpty().isBoolean(),
  checkAttendedOrAbsent,
);

attendanceRouter.post(
  '/attendances/class/:classCalendarId',
  isAuthenticated,
  checkAttendanceManyUsers,
);

module.exports = { attendanceRouter };
