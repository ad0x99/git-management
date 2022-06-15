// @ts-nocheck
const AWS = require('aws-sdk');
const fs = require('fs');

require('dotenv').config();

const accessKeyId = process.env.AWS_S3_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_S3_SECRET_ACCESS_KEY_ID;
const awsS3BucketName = process.env.AWS_S3_BUCKET_NAME;

AWS.config.update({
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey,
  region: 'ap-southeast-1',
});
const s3 = new AWS.S3({ apiVersion: '2006-03-01' });

const uploadFile = (file) => {
  const fileStream = fs.createReadStream(file.path);

  const uploadParams = {
    Bucket: awsS3BucketName,
    Body: fileStream,
    Key: file.filename,
  };

  return s3.upload(uploadParams).promise();
};

module.exports = { uploadFile };
