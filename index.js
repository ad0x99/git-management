const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { connectToDB } = require('./src/db/index.js');
const userRoutes = require('./src/routes/user.routes');

const main = async () => {
  const app = express();

  // Dotenv config
  dotenv.config();

  // App Config
  app.use(cors());
  app.use(express.json());

  // APIs Routes
  app.use('/api/users', userRoutes);

  // Server & Database
  await connectToDB();
  app.listen(process.env.NODE_PORT, () => {
    console.log(
      `Server is running on http://${process.env.NODE_HOST}:${process.env.NODE_PORT}/`
    );
  });
};

main();
