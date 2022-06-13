// @ts-nocheck
const { validationResult } = require('express-validator');
const { prepareResponse } = require('../CONST/response');
const { models } = require('../db');
const { logger } = require('../helpers/logger');

const getOneCalendar = async (req, res) => {
  const { id } = req.params;

  try {
    const calendar = await models.classCalendar.findFirst({
      where: { id },
    });

    if (!calendar) {
      return prepareResponse(res, 404, 'Class calendar not found!');
    }

    const userAttendance = await models.userAttendance.findMany({
      where: { classCalendarId: id },
    });

    return prepareResponse(res, 200, 'Get class calendar successfully', {
      data: { ...calendar, ...userAttendance },
      meta: { total: userAttendance.length, limit: 0, offset: 0 },
    });
  } catch (err) {
    logger.error(err);
    return prepareResponse(res, 400, 'System server error!');
  }
};

const getAllCalendar = async (req, res) => {
  try {
    const calendar = await models.classCalendar.findMany();

    return prepareResponse(res, 200, 'Get All Calendars Successfully', {
      data: calendar ? [...calendar] : [],
      meta: { total: calendar.length, limit: 0, offset: 0 },
    });
  } catch (error) {
    logger.error(error);
    return prepareResponse(res, 400, 'Get all Calendars Failed');
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
    const formatStudyDate = new Date(studyDate).toISOString();
    const newClassCalendar = await models.classCalendar.create({
      data: {
        classId,
        studyDate: formatStudyDate,
      },
    });

    // Get all users in the class
    const userClasses = await models.classUser.findMany({
      where: {
        classId,
      },
      select: {
        userId: true,
      },
    });

    // Check attendance for users in class
    // By default, all user's status in the class will be set to true
    // It means user will be able to join the class
    if (userClasses) {
      userClasses.map(
        async (user) =>
          await models.userAttendance.create({
            data: { userId: user.userId, classCalendarId: newClassCalendar.id },
          }),
      );
    }

    return prepareResponse(res, 201, 'Create Class Calendar Successfully', {
      calendar: newClassCalendar,
      users: userClasses,
    });
  } catch (err) {
    logger.error(err);
    console.error(err.message);
    return prepareResponse(res, 400, 'Create Class Calendar Failed');
  }
};

const deleteCalendar = async (req, res) => {
  const { id } = req.params;

  try {
    const calendar = await models.classCalendar.findFirst({ where: { id } });

    if (!calendar) {
      return prepareResponse(res, 404, 'Calendar not found!');
    }

    await models.$transaction([
      models.userAttendance.deleteMany({ where: { classCalendarId: id } }),
      models.classCalendar.delete({ where: { id } }),
    ]);

    return prepareResponse(res, 201, 'Delete Class Calendar Successfully!');
  } catch (error) {
    logger.error(error);
    return prepareResponse(res, 400, 'Delete Class Calendar');
  }
};

module.exports = {
  createCalendar,
  deleteCalendar,
  getAllCalendar,
  getOneCalendar,
};
