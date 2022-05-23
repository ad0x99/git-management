const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { userRouter, classRouter } = require('./routes/index');

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

  // Server & Database
  app.listen(process.env.NODE_PORT, () => {
    console.log(
      `Server is running on http://${process.env.NODE_HOST}:${process.env.NODE_PORT}/`,
    );
  });
};

main();
