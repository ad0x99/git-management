// @ts-nocheck
const { Role } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const { prepareResponse } = require('../CONST/response');
const { models } = require('../db');

/**
 * It checks if the user is authenticated and if the user is an admin
 * @param req - The request object.
 * @param res - The response object
 * @param next - This is a callback function that is called when the middleware is done.
 * @returns A function that is being exported.
 */
const isAdminPermission = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const verifiedToken = jwt.verify(token, process.env.SECRET_TOKEN);

      const user = await models.user.findFirst({
        where: { id: verifiedToken.id, roles: Role.ADMIN, active: true },
      });

      if (!user) {
        return prepareResponse(
          res,
          403,
          'You dont have permission to this resource',
        );
      }

      next();
    } catch (error) {
      console.error(error);
      return prepareResponse(res, 401, 'Not authorized, token failed');
    }
  }

  if (!token) {
    return prepareResponse(res, 401, 'Not authorized, token in missing');
  }
};

/**
 * It checks if the user is authenticated
 * @param req - The request object
 * @param res - The response object
 * @param next - This is a callback function that is called when the middleware is done.
 * @returns A function that is being exported.
 */
const isAuthenticated = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const verifiedToken = jwt.verify(token, process.env.SECRET_TOKEN);

      const user = await models.user.findFirst({
        where: { id: verifiedToken.id, active: true },
      });

      if (!user) {
        return prepareResponse(res, 403, 'Access denied!');
      }

      req.user = user;
      next();
    } catch (error) {
      console.error(error);
      return prepareResponse(res, 401, 'Not authorized, token failed');
    }
  }

  if (!token) {
    return prepareResponse(res, 401, 'Not authorized, token in missing');
  }
};

module.exports = { isAdminPermission, isAuthenticated };
