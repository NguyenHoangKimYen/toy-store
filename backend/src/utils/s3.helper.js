const s3 = require("../config/s3");
const { v4: uuidv4 } = require("uuid");

const uploadToS3 = async (files, folder = "Uncategorized") => {
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

const deleteFromS3 = async (urls) => {
    for (const url of urls) {
        try {
            const key = url.split(".amazonaws.com/")[1];

            if (!key) {
                console.warn("Could not extract key from URL:", url);
                continue;
            }

            const params = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: decodeURIComponent(key), // handle special characters like %20
            };

            await s3.deleteObject(params).promise();
            console.log("Successfully deleted from S3:", key);
        } catch (error) {
            console.error("Error deleting image from S3:", error.message);
        }
    }
};

module.exports = { uploadToS3, deleteFromS3 };
