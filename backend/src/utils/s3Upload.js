const s3 = require('../config/s3');
const { v4: uuidv4 } = require('uuid');

const uploadToS3 = async (files, folder = 'productImages') => {
  const uploadedUrls = [];

  for (const file of files) {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `${folder}/${uuidv4()}-${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const result = await s3.upload(params).promise();
    uploadedUrls.push(result.Location);
  }

  return uploadedUrls;
};

module.exports = { uploadToS3 };
