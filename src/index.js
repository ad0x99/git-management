const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const schedule = require('node-schedule');
const { userRouter, classRouter } = require('./routes/index');
const { models } = require('./db');
const { logger } = require('./helpers/logger');
const { classUserRouter } = require('./routes/classUser.routes');

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

  // Server & Database
  app.listen(process.env.NODE_PORT, async () => {
    const uploadPath = './uploads/';
    const time = '*/10 * * * * *';

    const isPathExists = fs.existsSync(path.resolve(uploadPath));
    if (!isPathExists) {
      console.log('Create uploads folder');
      fs.mkdirSync(uploadPath);
    }

    schedule.scheduleJob(time, async () => {
      console.log(new Date().toISOString().slice(0, 10));
      console.log('The world is going to end today.');
    });

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
