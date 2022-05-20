const { User } = require('../models/Users');

const isEmailExist = async (email) => {
  const user = await User.findOne({ email });
  if (user) {
    return true;
  }
  return false;
};

module.exports = { isEmailExist };
