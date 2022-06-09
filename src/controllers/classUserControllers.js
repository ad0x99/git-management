const { Role } = require('@prisma/client');
const { prepareResponse } = require('../CONST/response');
const { models } = require('../db');
const { logger } = require('../helpers/logger');

/**
 * It gets a single class user info from the database
 * @param req - The request object.
 * @param res - The response object.
 */
const getOneClassUser = async (req, res) => {
  const { id } = req.params;
  try {
    if (req.user.roles !== Role.ADMIN) {
      const isUserJoinedClass = await models.classUser.findFirst({
        where: { classId: id, userId: req.user.id },
      });

      if (!isUserJoinedClass) {
        return prepareResponse(
          res,
          403,
          'Access Denied! You have not joined this class',
        );
      }
    }

    const classInfo = await models.classUser.findFirst({
      where: { id },
    });

    return prepareResponse(res, 200, 'Get Class User Info successfully', {
      classInfo,
    });
  } catch (error) {
    logger.error(error);
    return prepareResponse(res, 404, 'Class User Not Found');
  }
};

/**
 * It gets all the class user from the database
 * @param req - The request object.
 * @param res - The response object.
 */
const getAllClassUser = async (req, res) => {
  try {
    const allClassesUser = await models.classUser.findMany();
    const count = allClassesUser.length;

    return prepareResponse(res, 200, 'Get all classes user successfully', {
      count,
      allClassesUser,
    });
  } catch (error) {
    logger.error(error);
    return prepareResponse(res, 404, 'Classes User Not Found');
  }
};

module.exports = {
  getOneClassUser,
  getAllClassUser,
};
