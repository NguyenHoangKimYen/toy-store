const express = require("express");
const router = express.Router();
const {
    getReviewsByProductId,
    createReview,
    updateReview,
    deleteReview,
    moderateReview,
    getPendingReviews
} = require("../controllers/review.controller");

const { uploadReviewImages } = require("../middlewares/upload.middleware.js");
const authMiddleware = require("../middlewares/auth.middleware.js");
const adminMiddlewares = require("../middlewares/admin.middleware.js")

router.get("/product/:productId", getReviewsByProductId);


router.use(authMiddleware);
router.get("/pending", getPendingReviews);
router.post("/", uploadReviewImages, createReview);
router.patch("/:reviewId", uploadReviewImages, updateReview);
router.delete("/:reviewId", deleteReview);


router.use(adminMiddlewares);
router.patch("/:reviewId/moderate", adminMiddlewares, moderateReview); 

module.exports = router;