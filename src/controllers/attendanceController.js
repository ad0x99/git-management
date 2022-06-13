const { prepareResponse } = require('../CONST/response');
const { models } = require('../db');
const { logger } = require('../helpers/logger');

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
      where: { id: idUserAttendance },
      data: { status: isAttendance },
    });

    return prepareResponse(res, 201, 'Check Attendance Successfully');
  } catch (err) {
    logger.error(err);
    return prepareResponse(res, 401, 'Check Attendance Failed');
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

    if (!isAttendanceArray.length) {
      return prepareResponse(res, 400, 'Bad request');
    }

    const attendances = { attendanceUser: [], absentUser: [] };

    // isAttendanceArray.reduce((pV, cV) => {
    //   return cV.isAttendance
    //     ? { ...pV, attendanceUser: [...pV.attendanceUser, cV.id] }
    //     : { ...pV, absentUser: [...pV.absentUser, cV.id] };
    // }, attendances);

    console.log(attendances);

    const [attendanceUser, absentUser] = await models.$transaction([
      models.userAttendance.updateMany({
        where: {
          id: {
            in: attendances.attendanceUser,
          },
        },
        data: {
          status: true,
        },
      }),
      models.userAttendance.updateMany({
        where: {
          id: {
            in: attendances.absentUser,
          },
        },
        data: {
          status: false,
        },
      }),
    ]);

    return prepareResponse(res, 201, 'Check Attendances Successfully', {
      ...attendanceUser,
      ...absentUser,
    });
  } catch (err) {
    logger.error(err);
    return prepareResponse(res, 400, 'Check Attendances Failed');
  }
};

module.exports = {
  checkAttendedOrAbsent,
  checkAttendanceMany,
  getAllAttendances,
};
