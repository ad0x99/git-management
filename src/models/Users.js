const mongoose = require('mongoose');

const USER_ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
};

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
  },
  email: {
    type: String,
    required: [true, 'Please tell us your email'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
  },
  active: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    enum: USER_ROLES,
    default: USER_ROLES.USER,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updatedAt: {
    type: Date,
    default: Date.now(),
  },
});

const User = mongoose.model('User', userSchema);
module.exports = { User, USER_ROLES };
