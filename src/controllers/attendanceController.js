const { Prisma } = require('@prisma/client');
const { prepareResponse, ACTION } = require('../CONST/response');
const { models } = require('../db');
const { logger } = require('../helpers/logger');
const { hasPermissionOnClass } = require('../middleware/auth');

const getAllAttendancesOfClass = async (req, res) => {
  const { classId } = req.params;

  try {
    const data = await models.$queryRaw`
    SELECT 
      class.id as classId, ua.id as attendanceId, ua.classCalendarId as calendarId, ua.userId, class.className as className, class.host as host, ua.status as status,class.startDate as startDate, class.endDate as endDate
    FROM UserAttendance AS ua
      LEFT OUTER JOIN ClassCalendar AS cc ON cc.id = ua.classCalendarId
      LEFT OUTER JOIN Class AS class ON class.id = cc.classId
    WHERE 
      class.id = ${classId}`;

    return prepareResponse(
      res,
      200,
      'Get All Attendances of Class Successfully',
      {
        data: data ? data : [],
      },
    );
  } catch (error) {
    logger.error(error);
    return prepareResponse(res, 400, 'Get All Attendances of Class Failed');
  }
};

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
    const hasPermission = await hasPermissionOnClass(
      req,
      res,
      ACTION.USER_ATTENDANCE,
      userAttendanceId,
    );

    if (!hasPermission) {
      return prepareResponse(res, 403, 'Access Denied');
    }

    const isExistAttendanceUser = await models.userAttendance.findFirst({
      where: { id: userAttendanceId },
    });

    if (!isExistAttendanceUser) {
      return prepareResponse(res, 404, 'User Attendance is not exist');
    }

    if (isAttendance === undefined || isAttendance === null) {
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
    const hasPermission = await hasPermissionOnClass(
      req,
      res,
      ACTION.CLASS_CALENDAR,
      classCalendarId,
    );

    if (!hasPermission) {
      return prepareResponse(res, 403, 'Access Denied');
    }

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
  getAllAttendancesOfClass,
};
