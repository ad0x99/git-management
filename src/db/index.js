// @ts-nocheck
const mongoose = require('mongoose');

const connectToDB = async () => {
  const connectString = `${process.env.DB_PROTOCOL}://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}${process.env.DB_PORT}/${process.env.DB_NAME}`;
  try {
    await mongoose.connect(connectString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`Connected to MongoDB ${connectString}`);
  } catch (err) {
    console.error(err);
  }
};

module.exports = { connectToDB };
