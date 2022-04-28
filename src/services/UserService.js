const { User } = require('../models/Users');

const isEmailExist = async (email) => {
  // Get email from database
  const user = await User.findOne({ where: { email } });
  if (user) {
    return true;
  }
  return false;
};

module.exports = { isEmailExist };
