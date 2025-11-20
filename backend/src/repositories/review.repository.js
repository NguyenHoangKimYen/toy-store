const Review = require("../models/review.model");
const { Types } = require("mongoose");


const createReview = async (data) => {
    return await Review.create(data);
};

const findReviewByUserAndProduct = async (userId, productId) => {
    return await Review.findOne({ 
        userId: new Types.ObjectId(userId), 
        productId: new Types.ObjectId(productId) 
    });
};

const getReviewsByProductId = async ({ 
    productId, 
    page = 1, 
    limit = 10, 
    sort = "newest", 
    filterRating = null 
}) => {
    const skip = (page - 1) * limit;
    
    const query = { 
        productId: new Types.ObjectId(productId),
        isPublished: true 
    };

    if (filterRating) {
        query.rating = filterRating;
    }

    const sortCondition = sort === "oldest" ? { createdAt: 1 } : { createdAt: -1 };

    const reviews = await Review.find(query)
        .populate("userId", "name avatar email")
        .sort(sortCondition)
        .skip(skip)
        .limit(limit)
        .lean();

    // Đếm tổng số để Frontend làm phân trang (1, 2, 3...)
    const totalCount = await Review.countDocuments(query);

    return {
        reviews,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: parseInt(page),
    };
};

const findReviewById = async (reviewId) => {
    return await Review.findById(reviewId);
};

const updateReviewById = async (reviewId, updateData) => {
    return await Review.findByIdAndUpdate(reviewId, updateData, {
        new: true,
    });
};

const deleteReviewById = async (reviewId) => {
    return await Review.findByIdAndDelete(reviewId);
};

module.exports = {
    createReview,
    findReviewByUserAndProduct,
    getReviewsByProductId,
    findReviewById,
    updateReviewById,
    deleteReviewById
};