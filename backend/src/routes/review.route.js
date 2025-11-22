const express = require("express");
const router = express.Router();
const {
    getReviewsByProductId,
    createReview,
    updateReview,
    deleteReview
} = require("../controllers/review.controller");

const {
    uploadReviewImages
} = require('../middlewares/upload.middleware.js');

const authMiddleware = require("../middlewares/auth.middleware"); 

// --- PUBLIC ROUTES ---
router.get("/product/:productId", getReviewsByProductId);

// middleware
router.use(authMiddleware);

// Các route bên dưới sẽ yêu cầu đăng nhập
router.post("/", uploadReviewImages, createReview);
router.patch("/:reviewId", updateReview);
router.delete("/:reviewId", deleteReview);

module.exports = router;