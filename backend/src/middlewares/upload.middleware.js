const multer = require('multer');

const storage = multer.memoryStorage();
const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

const upload = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        const ok = allowedMimeTypes.has(file.mimetype);
        if (!ok) {
            return cb(new Error('Only JPG/PNG/WebP images allowed'));
        }
        return cb(null, true);
    },
});

const uploadAvatar = upload.single('avatar');
const uploadProductImages = upload.array('images', 10);

module.exports = {
    uploadAvatar,
    uploadProductImages,
};
