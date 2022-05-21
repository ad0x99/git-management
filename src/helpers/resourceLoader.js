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
  const isResourceExist = resources.includes(resource);
  if (!isResourceExist) {
    throw new Error('Resource not found');
  }

  if (Array.isArray(params)) {
    throw new Error('Invalid params');
  }

  await models[resource].createMany({
    data: params.map((objects) => ({ id: uuidv4(), ...objects })),
  });
};

module.exports = { createOne, createMany };
