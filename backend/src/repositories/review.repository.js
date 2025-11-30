const Review = require('../models/review.model');
const { Types } = require('mongoose');

const createReview = async (data) => {
    return await Review.create(data);
};

const findReviewByUserAndProduct = async (userId, productId) => {
    return await Review.findOne({
        userId: new Types.ObjectId(userId),
        productId: new Types.ObjectId(productId),
    });
};

const getReviewsByProductId = async ({
    productId,
    page = 1,
    limit = 10,
    sort = 'newest',
    filterRating = null,
    currentUserId = null, // Optional: include this user's reviews regardless of status
}) => {
    const skip = (page - 1) * limit;

    // Build query: approved reviews OR current user's own reviews (any status)
    let query;
    if (currentUserId) {
        query = {
            productId: new Types.ObjectId(productId),
            $or: [
                { status: 'approved' },
                { userId: new Types.ObjectId(currentUserId) }
            ]
        };
    } else {
        query = {
            productId: new Types.ObjectId(productId),
            status: 'approved',
        };
    }

    if (filterRating) {
        query.rating = filterRating;
    }

    const sortCondition =
        sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };

    const reviews = await Review.find(query)
        .populate('userId', 'fullName avatar email username')
        .populate('variantId', 'attributes imageUrls price')
        .sort(sortCondition)
        .skip(skip)
        .limit(limit)
        .lean();

    // Add isHelpful flag if user is authenticated
    const reviewsWithHelpful = reviews.map(review => ({
        ...review,
        isHelpful: currentUserId 
            ? review.helpfulUsers.some(id => id.toString() === currentUserId.toString())
            : false
    }));

    const totalCount = await Review.countDocuments(query);

    return {
        reviews: reviewsWithHelpful,
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

const getReviewedProductIdsByUser = async (userId) => {
    const reviews = await Review.find({ userId: userId }).select("productId").lean();
    return reviews.map(r => r.productId.toString());
};

module.exports = {
    createReview,
    findReviewByUserAndProduct,
    getReviewsByProductId,
    findReviewById,
    updateReviewById,
    deleteReviewById,
    getReviewedProductIdsByUser,
};
