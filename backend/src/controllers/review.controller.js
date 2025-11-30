const ReviewService = require('../services/review.service');
const Review = require('../models/review.model');

const createReview = async (req, res, next) => {
    try {
        const userId = req.user._id || req.user.id;
        // Get data from body - now uses orderItemId instead of variantId
        const { productId, orderItemId, rating, comment } = req.body;

        // Get image files from request (handled by upload middleware)
        const imgFiles = req.files;

        if (!rating || rating < 1 || rating > 5) {
            return res
                .status(400)
                .json({ message: 'Rating must be between 1 and 5 stars' });
        }

        if (!orderItemId) {
            return res
                .status(400)
                .json({ message: 'Order item ID is required' });
        }

        const newReview = await ReviewService.createReview({
            userId,
            productId,
            orderItemId,
            rating,
            comment,
            imgFiles,
        });

        return res.status(201).json({
            message: 'Product review created successfully!',
            metadata: newReview,
        });
    } catch (error) {
        next(error);
    }
};

const checkEligibility = async (req, res, next) => {
    try {
        const userId = req.user._id || req.user.id;
        const { productId } = req.params;

        const result = await ReviewService.checkReviewEligibility(userId, productId);

        return res.status(200).json({
            success: true,
            message: result.message,
            metadata: {
                canReview: result.canReview,
                eligibleItems: result.eligibleItems,
            },
        });
    } catch (error) {
        next(error);
    }
};

const updateReview = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { reviewId } = req.params;

        // Lấy data update
        const { rating, comment, deletedImages } = req.body;
        // Lấy ảnh mới muốn thêm vào
        const imgFiles = req.files;

        // Validate sơ bộ rating nếu có gửi lên
        if (rating && (rating < 1 || rating > 5)) {
            return res
                .status(400)
                .json({ message: 'Rating must be between 1 and 5 stars' });
        }

        const updatedReview = await ReviewService.updateReview({
            userId,
            reviewId,
            rating,
            comment,
            imgFiles, // Ảnh mới
            deletedImages, // Ảnh cũ muốn xóa (URL string hoặc mảng URL)
        });

        return res.status(200).json({
            message: 'Review updated successfully',
            metadata: updatedReview,
        });
    } catch (error) {
        next(error);
    }
};

const getReviewsByProductId = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const { page, limit, sort, rating } = req.query;
        // Get user ID if authenticated (optional)
        const currentUserId = req.user?._id || req.user?.id || null;
        
        const result = await ReviewService.getReviewsByProductId({
            productId,
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 5,
            sort,
            filterRating: rating ? parseInt(rating) : null,
            currentUserId,
        });
        return res.status(200).json({ message: 'Success', metadata: result });
    } catch (error) {
        next(error);
    }
};

const deleteReview = async (req, res, next) => {
    try {
        const userId = req.user._id || req.user.id;
        const { reviewId } = req.params;
        // Check for admin - user model uses 'role' (singular) not 'roles'
        const isAdmin = req.user.role === 'admin' || 
            (req.user.roles && req.user.roles.includes('admin'));

        await ReviewService.deleteReview({ userId, reviewId, isAdmin });

        return res
            .status(200)
            .json({ message: 'Deleted successfully', metadata: null });
    } catch (error) {
        next(error);
    }
};

const moderateReview = async (req, res, next) => {
    try {
        // Check quyền Admin (nếu middleware auth chưa check kỹ)
        // Giả sử req.user.roles chứa mảng roles
        if (!req.user.roles || !req.user.roles.includes('admin')) {
            return res
                .status(403)
                .json({ message: 'Access denied. Admin only.' });
        }

        const { reviewId } = req.params;
        const { status, reason } = req.body; // status: 'approved' | 'rejected'

        const result = await ReviewService.moderateReview({
            reviewId,
            adminId: req.user._id,
            status,
            reason,
            reason,
        });

        return res.status(200).json({
            message: `Review has been ${status}`,
            metadata: result,
        });
    } catch (error) {
        next(error);
    }
};

const getPendingReviews = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const result = await ReviewService.getProductsToReview(userId);
        
        return res.status(200).json({
            success: true,
            message: "Lấy danh sách chờ đánh giá thành công",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/reviews/:reviewId/helpful
 * @desc    Toggle helpful status for a review
 * @access  Private
 */
const toggleHelpful = async (req, res, next) => {
    try {
        const { reviewId } = req.params;
        const userId = (req.user?._id || req.user?.id)?.toString();
        
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Initialize helpfulUsers if it doesn't exist
        if (!review.helpfulUsers) {
            review.helpfulUsers = [];
        }

        // Check if user already marked as helpful (compare as strings, handle nulls)
        const hasLiked = review.helpfulUsers.some(
            id => id && id.toString() === userId
        );

        if (hasLiked) {
            // Unlike: remove user from helpfulUsers array
            review.helpfulUsers = review.helpfulUsers.filter(
                id => id && id.toString() !== userId
            );
            review.helpfulCount = Math.max(0, (review.helpfulCount || 0) - 1);
        } else {
            // Like: add user to helpfulUsers array
            review.helpfulUsers.push(userId);
            review.helpfulCount = (review.helpfulCount || 0) + 1;
        }

        await review.save();

        res.status(200).json({
            message: hasLiked ? 'Removed helpful mark' : 'Marked as helpful',
            helpfulCount: review.helpfulCount,
            isHelpful: !hasLiked,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createReview,
    getReviewsByProductId,
    updateReview,
    deleteReview,
    moderateReview,
    getPendingReviews,
    checkEligibility,
    toggleHelpful
};
