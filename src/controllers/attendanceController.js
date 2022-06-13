const { prepareResponse } = require('../CONST/response');
const { models } = require('../db');
const { logger } = require('../helpers/logger');

const getAllAttendances = async (req, res) => {
  try {
    const attendances = await models.userAttendance.findMany({
      include: {
        user: { select: { name: true } },
        classCalendar: { select: { id: true, studyDate: true } },
      },
    });

    return prepareResponse(res, 200, 'Get All Attendances Successfully', {
      data: attendances ? [...attendances] : [],
      meta: { total: attendances.length, limit: 0, offset: 0 },
    });
  } catch (error) {
    logger.error(error);
    return prepareResponse(res, 400, 'Get All Attendances Failed');
  }
};

const checkAttendedOrAbsent = async (req, res) => {
  const { userAttendanceId } = req.params;
  const { isAttendance } = req.body;

  try {
    const isExistAttendanceUser = await models.userAttendance.findFirst({
      where: { id: userAttendanceId },
    });

    if (!isExistAttendanceUser) {
      return prepareResponse(res, 404, 'User Attendance is not exist');
    }

    if (isAttendance !== true || isAttendance === false) {
      return prepareResponse(res, 400, 'Bad request');
    }

    const attendance = await models.userAttendance.update({
      where: { id: userAttendanceId },
      data: { status: isAttendance },
      include: {
        classCalendar: { select: { id: true, classId: true } },
        user: { select: { id: true, name: true } },
      },
    });

    return prepareResponse(res, 201, 'Check Attendance Successfully', {
      data: attendance,
    });
  } catch (err) {
    logger.error(err);
    return prepareResponse(res, 401, 'Check Attendance Failed');
  }
};

const checkAttendanceManyUsers = async (req, res) => {
  const { classCalendarId } = req.params;

  try {
    const isClassCalendarExists = await models.classCalendar.findFirst({
      where: { id: classCalendarId },
    });

    if (!isClassCalendarExists) {
      return prepareResponse(res, 404, 'Class Calendar is not exist');
    }

    const attendanceAllUsers = await models.userAttendance.updateMany({
      where: { classCalendarId },
      data: { status: true },
    });

    return prepareResponse(res, 201, 'Check Attendances Successfully', {
      data: attendanceAllUsers,
    });
  } catch (err) {
    logger.error(err);
    return prepareResponse(res, 401, 'Check Attendances Failed');
  }
};

module.exports = {
  checkAttendedOrAbsent,
  checkAttendanceManyUsers,
  getAllAttendances,
};
