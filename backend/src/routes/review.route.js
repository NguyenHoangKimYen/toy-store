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

// Optional auth middleware - sets req.user if token exists, but doesn't require it
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(); // No token, continue without user
    }
    // Use the regular auth middleware but catch errors
    authMiddleware(req, res, (err) => {
        if (err) {
            // Token invalid/expired, continue without user
            return next();
        }
        next();
    });
};

// --- PUBLIC ROUTES (with optional auth to show user's own pending reviews) ---
router.get("/product/:productId", optionalAuth, getReviewsByProductId);

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
