const multer = require('multer');

const errorHandler = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            if (err.field === 'categoryImages') {
                return res.status(400).json({
                    success: false,
                    message:
                        'You are only allowed to upload a maximum of 1 image for the category!',
                });
            }

            return res.status(400).json({
                success: false,
                message: `You have uploaded more than the allowed number of images for the field '${err.field}'.`,
            });
        }

        // Error: LIMIT_FILE_SIZE (File is too large)
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message:
                    'Image file is too large! Please choose a smaller image.',
            });
        }
    }

    // --- Other Errors ---
    const statusCode = err.status || 500;
    return res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal Server Error',
    });
};

module.exports = errorHandler;
