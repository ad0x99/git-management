const { validationResult } = require('express-validator');
const { prepareResponse } = require('../CONST/response');
const { models } = require('../db');
const { logger } = require('../helpers/logger');
const { isAdmin } = require('./authController');

/**
 * It gets all the classes from the database
 * @param req - The request object.
 * @param res - The response object.
 */
const getAllClass = async (req, res) => {
  try {
    const allClasses = await models.class.findMany();
    const count = allClasses.length;

    return prepareResponse(res, 200, 'Get all classes successfully', {
      count,
      allClasses,
    });
  } catch (error) {
    logger.error(error);
    return prepareResponse(res, 404, 'Classes Not Found');
  }
};

/**
 * It creates a new class
 * @param req - The request object.
 * @param res - the response object
 */
const createNewClass = async (req, res) => {
  const { host, className, subject, startDate, endDate } = req.body;

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const isUserExists = await models.user.findFirst({ where: { id: host } });
    if (!isUserExists) {
      return prepareResponse(res, 404, 'Host not found');
    }

    const newClass = await models.class.create({
      data: {
        host,
        className,
        subject,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      },
    });

    return prepareResponse(res, 201, 'Created New Class Successfully', {
      newClass,
    });
  } catch (error) {
    logger.error(error);
    return prepareResponse(res, 400, 'Create New Class Failed');
  }
};

/**
 * It updates the class information
 * @param req - The request object.
 * @param res - The response object.
 */
const updateClass = async (req, res) => {
  const { host, className, subject, startDate, endDate } = req.body;
  const { id } = req.params;
  let params = {};

  try {
    const [isClassExists, isUserExists] = await Promise.all([
      models.class.findFirst({ where: { id } }),
      models.user.findFirst({ where: { id: host } }),
    ]);

    const isAdminRole = await isAdmin(req, res);

    if (!isClassExists) {
      return prepareResponse(res, 404, 'Class not exists');
    }

    if (host && !isUserExists) {
      return prepareResponse(res, 404, 'User not exists');
    }

    if (isAdminRole) {
      params = { host, className, subject, startDate, endDate };
    } else {
      params = { className, subject, startDate, endDate };
    }

    const classInfo = await models.class.update({
      where: { id },
      data: { ...params },
    });
    return prepareResponse(res, 201, 'Update Class Info Successfully', {
      classInfo,
    });
  } catch (error) {
    logger.error(error);
    return prepareResponse(res, 400, 'Update Class Info Failed');
  }
};

/**
 * It deletes a class from the database
 * @param req - The request object.
 * @param res - The response object.
 */
const deleteClass = async (req, res) => {
  const { id } = req.params;

  try {
    const isClassExists = await models.class.findFirst({ where: { id } });

    if (!isClassExists) {
      return prepareResponse(res, 404, 'Class not exists');
    }

    await models.class.delete({ where: { id } });
    return prepareResponse(res, 201, 'Class is deleted');
  } catch (error) {
    logger.error(error);
    return prepareResponse(res, 400, 'Delete Class Failed');
  }
};

module.exports = { getAllClass, createNewClass, updateClass, deleteClass };
