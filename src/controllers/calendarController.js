const { validationResult } = require('express-validator');
const { prepareResponse } = require('../CONST/response');
const { models } = require('../db');
const { logger } = require('../helpers/logger');

const getOneCalendar = async (req, res) => {
  const { id } = req.params;
  try {
    const calendar = await models.classCalendar.findFirst({
      where: { id: id },
    });
    if (!calendar) {
      return prepareResponse(res, 404, 'Class calendar not found!');
    }

    const userAttendance = await models.userAttendance.findMany({
      where: { classCalendarId: id },
    });

    return prepareResponse(res, 200, 'Get class calendar successfully', {
      result: { calendar: calendar, userAttendance: userAttendance },
      meta: { total: userAttendance.length, limit: 0, offset: 0 },
    });
  } catch (err) {
    logger.error(err);
    return prepareResponse(res, 500, 'System server error!');
  }
};

const getAllCalendar = async (req, res) => {
  const classId = req.params.classId;
  try {
    const calendar = await models.classCalendar.findMany({
      where: { classId: classId ? { equals: classId } : { notIn: null } },
    });
    return prepareResponse(res, 200, 'Get all calendar successfully', {
      result: { calendars: calendar },
      meta: { total: calendar.length, limit: 0, offset: 0 },
    });
  } catch (error) {
    logger.error(error);
    return prepareResponse(res, 500, 'System server error!');
  }
};

const createCalendar = async (req, res) => {
  const { classId, studyDate } = req.body;

  try {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      logger.error(error.array());
      return res.status(400).json({ errors: error.array() });
    }

    const isClassExists = await models.class.findFirst({
      where: { id: classId },
    });
    if (!isClassExists) {
      return prepareResponse(res, 400, 'Class not found');
    }

    // Create new class calendar
    const newCalendar = await models.classCalendar.create({
      data: {
        classId,
        studyDate,
      },
    });

    // Get all users in the class
    const userClass = await models.classUser.findMany({
      where: {
        classId: classId,
      },
      select: {
        userId,
      },
    });

    // Add all attendance in the class for users
    const newCalendarAttendance = models.userAttendance.createMany({
      data: userClass.map((i) => {
        userId: i;
        classCalendarId: newCalendar.id;
      }),
    });

    return prepareResponse(res, 201, 'Create successfully', {
      calendar: newCalendar,
      users: newCalendarAttendance,
    });
  } catch (err) {
    logger.error(err);
    return prepareResponse(res, 500, 'System server error!');
  }
};

const deleteCalendar = async (req, res) => {
  const { id } = req.params;
  try {
    const calendar = await models.classCalendar.findFirst({ where: { id } });
    if (!calendar) {
      return prepareResponse(res, 404, 'Calendar not found!');
    }
    // Chưa nắm rõ cách dùng transaction của prisma. Xóa calendar và tất cả các record về attendance của user.
    await models.$transaction([
      prisma.userAttendance.deleteMany({ where: { classCalendarId: id } }),
      prisma.classCalendar.delete({ where: { id } }),
    ]);

    return prepareResponse(res, 201, 'Delete Successfully!');
  } catch (error) {
    logger.error(error);
    return prepareResponse(res, 500, 'System server error!');
  }
};


modules.exports = {
  createCalendar,
  deleteCalendar,
  getAllCalendar,
  getOneCalendar
}
