const { prepareResponse } = require('../CONST/response');
const { models } = require('../db');
const { logger } = require('../helpers/logger');

const checkAttendedOrAbsent = async (req, res) => {
  const { idUserAttendance } = req.params;
  const { isAttendance } = req.body;
  try {
    const isExistAttendanceUser = await models.userAttendance.findFirst({
      where: { id: idUserAttendance },
    });
    if (!isExistAttendanceUser) {
      return prepareResponse(res, 404, 'Attendance User is not exist');
    }
    if (isAttendance === undefined) {
      return prepareResponse(res, 404, 'Bad request');
    }
    await models.userAttendance.update({
      where: { id },
      data: { status: isAttendance ? 1 : 0, updatedAt: new Date() },
    });

    return prepareResponse(res, 2001, 'Successfully');
  } catch (err) {
    logger.error(err);
    return prepareResponse(res, 500, 'System server error!');
  }
};

const checkAttendanceMany = async (req, res) => {
  const { idClassCalendar } = req.params;
  const { isAttendanceArray } = req.body;
  try {
    const isClassCalendar = await models.classCalendar.findFirst({
      where: { id: idClassCalendar },
    });
    if (!isClassCalendar) {
      return prepareResponse(res, 404, 'Class Calendar is not exist');
    }
    if (isAttendanceArray === undefined) {
      return prepareResponse(res, 404, 'Bad request');
    }
    let dictAttendance = { attendenUser: [], absentUser: [] };
    isAttendanceArray.reduce((pV, cV) => {
      return cV.isAttendance
        ? { ...pV, attendenUser: [...pV.attendenUser, cV.id] }
        : { ...pV, absentUser: [...pV.absentUser, cV.id] };
    }, dictAttendance);

    const updateAttendanceUser = await models.userAttendance.updateMany({
      where: {
        id: {
          in: dictAttendance.attendenUser,
        },
      },
      data: {
        status: 1,
      },
    });
    const updateAbsentUser = await models.userAttendance.updateMany({
      where: {
        id: {
          in: dictAttendance.absentUser,
        },
      },
      data: {
        status: 0,
      },
    });

    return prepareResponse(res, 2001, 'Successfully');
  } catch (err) {
    logger.error(err);
    return prepareResponse(res, 500, 'System server error!');
  }
};

modules.exports = {
  checkAttendedOrAbsent,
  checkAttendanceMany,
};
