const express = require('express');
const router = express.Router();
const {
    getReviewsByProductId,
    createReview,
    updateReview,
    deleteReview,
    moderateReview,
    getPendingReviews,
    checkEligibility
} = require("../controllers/review.controller");

const { uploadReviewImages } = require("../middlewares/upload.middleware.js");
const authMiddleware = require("../middlewares/auth.middleware.js");
const adminOnly = require("../middlewares/admin.middleware.js");

// --- PUBLIC ROUTES ---
router.get("/product/:productId", getReviewsByProductId);

// --- AUTHENTICATED ROUTES ---
router.use(authMiddleware);
router.get("/pending", getPendingReviews);
router.get("/eligibility/:productId", checkEligibility); // Check if user can review a product
router.post("/", uploadReviewImages, createReview);
router.patch("/:reviewId", uploadReviewImages, updateReview);
router.delete("/:reviewId", deleteReview);

// --- ADMIN ROUTES ---
router.use(adminOnly);
router.patch("/:reviewId/moderate", moderateReview); 

module.exports = router;
