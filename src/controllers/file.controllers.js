const multer = require('multer');
const path = require('path');
const { FILE_ENUMS } = require('../CONST/file-enums');

const storage = multer.diskStorage({
  destination: (req, res, cb) => {
    cb(null, 'uploads');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// Filter image extension
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === FILE_ENUMS.TYPE.JPG ||
    file.mimetype === FILE_ENUMS.TYPE.PNG ||
    file.mimetype === FILE_ENUMS.TYPE.SVG
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage,
  fileFilter,
});

module.exports = { upload };
