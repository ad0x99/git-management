const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { userRouter, classRouter } = require('./routes/index');
const { models } = require('./db');
const { logger } = require('./helpers/logger');
const { classUserRouter } = require('./routes/classUser.routes');
const { calendarRouter } = require('./routes/calendar.routes');
const { attendanceRouter } = require('./routes/attendance.routes');

const main = async () => {
  const app = express();

  // Dotenv config
  dotenv.config();

  // App Config
  app.use(cors());
  app.use(express.json());

  // APIs Routes
  app.use('/api/v1', userRouter);
  app.use('/api/v1', classRouter);
  app.use('/api/v1', classUserRouter);
  app.use('/api/v1', calendarRouter);
  app.use('/api/v1', attendanceRouter);

  // Server & Database
  app.listen(process.env.NODE_PORT, async () => {
    const uploadPath = './uploads/';

    const isPathExists = fs.existsSync(path.resolve(uploadPath));
    if (!isPathExists) {
      console.log('Create uploads folder');
      fs.mkdirSync(uploadPath);
    }

    await models
      .$connect()
      .then(() => console.log('DB Connected'))
      .catch((e) => {
        logger.error(e);
        console.log(e);
      });

    console.log(
      `Server is running on http://${process.env.NODE_HOST}:${process.env.NODE_PORT}/`,
    );
  });
};

main();
