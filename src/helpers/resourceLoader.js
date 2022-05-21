<<<<<<< HEAD
const { v4: uuidv4 } = require('uuid');
const { models } = require('../db');

const resources = [
  'user',
  'class',
  'classCalendar',
  'classUser',
  'file',
  'userAttendance',
];

/**
 * It creates a new record in the database
 * @param resource - The name of the resource you want to create.
 * @param params - The data you want to create.
 */
const createOne = async (resource, params) => {
  const isResourceExist = resources.includes(resource);

  if (!isResourceExist) {
    throw new Error('Resource not found');
  }

  try {
    const id = uuidv4();
    await models[resource].create({
=======
const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');
const { models } = require('../db');

// All of these functions in this file are just for testing purposes
// Do not use these functions
const getModel = (resources) => {
  let resource = null;

  switch (resources.toString()) {
    case 'user':
      resource = models.user.create;
      break;
    case 'class':
      resource = models.class;
      break;
    case 'classCalendar':
      resource = models.classCalendar;
      break;
    case 'classUser':
      resource = models.classUser;
      break;
    case 'file':
      resource = models.file;
      break;
    case 'userAttendance':
      resource = models.userAttendance;
      break;
    default:
      break;
  }

  return resource;
};

/**
 * It creates a new record in the database
 * @param model - The name of the resource you want to create.
 * @param params - The data you want to create.
 */
const createOne = async (model, params) => {
  try {
    const id = uuidv4();
    const resource = getModel(model);

    await models[model].create({
>>>>>>> 90ec114 (refactor: uuid and handle auth/user controllers)
      data: { id, ...params },
    });
  } catch (error) {
    throw new Error(error.message);
  }
};

/**
 * It creates many resources
 * @param resource - The name of the resource you want to create.
 * @param params - The data to be created.
 */
const createMany = async (resource, params) => {
<<<<<<< HEAD
  const isResourceExist = resources.includes(resource);
  if (!isResourceExist) {
    throw new Error('Resource not found');
  }

=======
>>>>>>> 90ec114 (refactor: uuid and handle auth/user controllers)
  if (Array.isArray(params)) {
    throw new Error('Invalid params');
  }

  await models[resource].createMany({
    data: params.map((objects) => ({ id: uuidv4(), ...objects })),
  });
};

module.exports = { createOne, createMany };
