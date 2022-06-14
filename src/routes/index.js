const { userRouter } = require('./user.routes');
const { classRouter } = require('./class.routes');
const { classUserRouter } = require('./classUser.routes');
const { calendarRouter } = require('./calendar.routes');
const { attendanceRouter } = require('./attendance.routes');

module.exports = {
  userRouter,
  classRouter,
  classUserRouter,
  calendarRouter,
  attendanceRouter,
};
