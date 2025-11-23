const multer = require("multer");

// Lưu file vào RAM để upload lên S3
const storage = multer.memoryStorage();

// Các định dạng ảnh được cho phép
const allowedMimeTypes = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
]);

// Cấu hình Multer
const upload = multer({
    storage,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB, dư cho avatar/product
    },
    fileFilter: (_req, file, cb) => {
        const ok = allowedMimeTypes.has(file.mimetype);
        if (!ok) {
            return cb(new Error("Only JPG, PNG, WebP images are allowed"));
        }
        cb(null, true);
    },
});

// ============ Upload Types ============

// Upload avatar: field "avatar"
const uploadAvatar = upload.single("avatar");

// Upload images cho product
const uploadProductImages = upload.array("images", 10);

// Upload images cho variant
const uploadVariantImages = upload.array("variantImages", 10);

// Upload images cho review
const uploadReviewImages = upload.array("reviewImages", 5);
const uploadCategoryImages = upload.array("categoryImages", 1);

module.exports = {
    uploadAvatar,
    uploadProductImages,
    uploadVariantImages,
    uploadReviewImages,
    uploadCategoryImages,
};
