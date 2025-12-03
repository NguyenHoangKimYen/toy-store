const s3 = require('../config/s3');
const { v4: uuidv4 } = require('uuid');

const uploadToS3 = async (files, folder = 'Uncategorized') => {
    // Upload all files in parallel for better performance
    const uploadPromises = files.map(async (file) => {
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `${folder}/${uuidv4()}-${file.originalname}`,
            Body: file.buffer,
            ContentType: file.mimetype,
            // Cache headers for better PageSpeed scores
            // Images with UUID are immutable - cache for 1 year
            CacheControl: 'public, max-age=31536000, immutable',
            // Security header
            Metadata: {
                'cache-policy': 'immutable'
            }
        };

        const result = await s3.upload(params).promise();
        return result.Location;
    });

    const uploadedUrls = await Promise.all(uploadPromises);
    return uploadedUrls;
};

const deleteFromS3 = async (urls) => {
    for (const url of urls) {
        try {
            const key = url.split('.amazonaws.com/')[1];
            if (!key) {
                console.warn('Could not extract key from URL:', url);
                continue;
            }

            const decodedKey = decodeURIComponent(key.replace(/\+/g, ' '));
            console.log('Extracted and decoded key:', decodedKey);

            const params = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: decodedKey,
            };

            await s3.deleteObject(params).promise();
        } catch (error) {
            console.error('❌ Error deleting image from S3:', error.message);
        }
    }
};

module.exports = { uploadToS3, deleteFromS3 };
