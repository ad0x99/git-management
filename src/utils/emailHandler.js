const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const { logger } = require('../helpers/logger');

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendConfirmEmail = async (options) => {
  try {
    await transporter.sendMail({ ...options });
  } catch (err) {
    logger.error(err);
  }
};

module.exports = { sendConfirmEmail };
