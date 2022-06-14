// @ts-nocheck
const { validationResult } = require('express-validator');
const { prepareResponse, ACTION } = require('../CONST/response');
const { models } = require('../db');
const { logger } = require('../helpers/logger');
const { hasPermissionOnClass } = require('../middleware/auth');

/**
 * It gets a class calendar by id
 * @param req - The request object.
 * @param res - the response object
 */
const getOneCalendar = async (req, res) => {
  const { id } = req.params;

  try {
    const hasPermission = await hasPermissionOnClass(
      req,
      res,
      ACTION.CLASS_CALENDAR,
      id,
    );

    if (!hasPermission) {
      return prepareResponse(res, 403, 'Access Denied');
    }

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
    return prepareResponse(res, 400, 'Get class calendar failed');
  }
};

/**
 * It gets all the calendars from the database
 * @param req - The request object.
 * @param res - The response object
 * @returns An array of objects
 */
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

/**
 * Create a new class calendar and set all users' attendance status to true
 * @param req - The request object.
 * @param res - response object
 */
const createCalendar = async (req, res) => {
  const { classId, studyDate } = req.body;

  try {
    const hasPermission = await hasPermissionOnClass(
      req,
      res,
      ACTION.CLASS_CALENDAR,
      classId,
    );

    if (!hasPermission) {
      return prepareResponse(res, 403, 'Access Denied');
    }

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
    return prepareResponse(res, 400, 'Create Class Calendar Failed');
  }
};

/**
 * It deletes a class calendar and all the attendance records associated with it
 * @param req - The request object.
 * @param res - The response object
 */
const deleteCalendar = async (req, res) => {
  const { id } = req.params;

  try {
    const hasPermission = await hasPermissionOnClass(
      req,
      res,
      ACTION.CLASS_CALENDAR,
      id,
    );

    if (!hasPermission) {
      return prepareResponse(res, 403, 'Access Denied');
    }

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
