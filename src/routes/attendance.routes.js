const express = require('express');
const { body } = require('express-validator');
const {
  checkAttendedOrAbsent,
  checkAttendanceManyUsers,
  getAllAttendances,
  getAllAttendancesOfClass,
} = require('../controllers/attendanceController');
const { isAuthenticated, isAdminPermission } = require('../middleware/auth');

const attendanceRouter = express.Router();

attendanceRouter.get(
  '/attendances/:classId',
  isAuthenticated,
  getAllAttendancesOfClass,
);
attendanceRouter.get(
  '/attendances',
  isAuthenticated,
  isAdminPermission,
  getAllAttendances,
);

attendanceRouter.post(
  '/attendances/user/:userAttendanceId',
  isAuthenticated,
  body('isAttendance').notEmpty().isBoolean(),
  checkAttendedOrAbsent,
);

attendanceRouter.post(
  '/attendances/class/:classCalendarId',
  isAuthenticated,
  checkAttendanceManyUsers,
);

module.exports = { attendanceRouter };
