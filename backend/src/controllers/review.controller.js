const ReviewService = require("../services/review.service");

const createReview = async (req, res, next) => {
    try {
        const userId = req.user._id;
        // Lấy text data từ body
        const { productId, variantId, rating, comment } = req.body;

        // Lấy files ảnh từ request (do middleware upload xử lý)
        const imgFiles = req.files;

        if (!rating || rating < 1 || rating > 5) {
            return res
                .status(400)
                .json({ message: "Rating must be between 1 and 5 stars" });
        }

        const newReview = await ReviewService.createReview({
            userId,
            productId,
            variantId,
            rating,
            comment,
            imgFiles, // Truyền file sang service
        });

        return res.status(201).json({
            message: "Product review created successfully!",
            metadata: newReview,
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
                .json({ message: "Rating must be between 1 and 5 stars" });
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
            message: "Review updated successfully",
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
        const result = await ReviewService.getReviewsByProductId({
            productId,
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 5,
            sort,
            filterRating: rating ? parseInt(rating) : null,
        });
        return res.status(200).json({ message: "Success", metadata: result });
    } catch (error) {
        next(error);
    }
};

const deleteReview = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { reviewId } = req.params;
        const isAdmin = req.user.roles
            ? req.user.roles.includes("admin")
            : false;

        await ReviewService.deleteReview({ userId, reviewId, isAdmin });

        return res
            .status(200)
            .json({ message: "Deleted successfully", metadata: null });
    } catch (error) {
        next(error);
    }
};

const moderateReview = async (req, res, next) => {
    try {
        // Check quyền Admin (nếu middleware auth chưa check kỹ)
        // Giả sử req.user.roles chứa mảng roles
        if (!req.user.roles || !req.user.roles.includes("admin")) {
            return res
                .status(403)
                .json({ message: "Access denied. Admin only." });
        }

        const { reviewId } = req.params;
        const { status, reason } = req.body; // status: 'approved' | 'rejected'

        const result = await ReviewService.moderateReview({
            reviewId,
            adminId: req.user._id,
            status,
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

module.exports = {
    createReview,
    getReviewsByProductId,
    updateReview,
    deleteReview,
    moderateReview,
    getPendingReviews
};
