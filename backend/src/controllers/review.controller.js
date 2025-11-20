const ReviewService = require("../services/review.service");



const createReview = async (req, res, next) => {
    try {
        const userId = req.user._id;
        // Chỉ nhận rating và comment
        const { productId, variantId, rating, comment } = req.body;

        const newReview = await ReviewService.createReview({
            userId,
            productId,
            variantId,
            rating,
            comment
        });

        return res.status(201).json({
            message: "Đánh giá sản phẩm thành công!",
            metadata: newReview
        });

    } catch (error) {
        next(error);
    }
};

const updateReview = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { reviewId } = req.params;
        // Chỉ nhận rating và comment
        const { rating, comment } = req.body;

        const updatedReview = await ReviewService.updateReview({
            userId,
            reviewId,
            rating,
            comment
        });

        return res.status(200).json({
            message: "Cập nhật đánh giá thành công",
            metadata: updatedReview
        });

    } catch (error) {
        next(error);
    }
};

// Các hàm get và delete giữ nguyên như cũ
const getReviewsByProductId = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const { page, limit, sort, rating } = req.query;
        const result = await ReviewService.getReviewsByProductId({
            productId,
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 5,
            sort,
            filterRating: rating ? parseInt(rating) : null
        });
        return res.status(200).json({ message: "Success", metadata: result });
    } catch (error) { next(error); }
};

const deleteReview = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { reviewId } = req.params;
        const isAdmin = req.user.roles ? req.user.roles.includes('admin') : false;
        await ReviewService.deleteReview({ userId, reviewId, isAdmin });
        return res.status(200).json({ message: "Deleted successfully", metadata: null });
    } catch (error) { next(error); }
};


module.exports = {
    createReview,
    getReviewsByProductId,
    updateReview,
    deleteReview
}