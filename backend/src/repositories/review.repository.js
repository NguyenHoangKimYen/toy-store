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
        isHelpful: currentUserId && review.helpfulUsers?.length
            ? review.helpfulUsers.some(id => id && id.toString() === currentUserId.toString())
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

/**
 * Get review statistics for a product (lightweight aggregation)
 * Returns total, average rating, and rating distribution
 */
const getReviewStats = async (productId) => {
    const stats = await Review.aggregate([
        { 
            $match: { 
                productId: new Types.ObjectId(productId),
                status: 'approved'
            } 
        },
        {
            $group: {
                _id: null,
                total: { $sum: 1 },
                avgRating: { $avg: '$rating' },
                rating1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
                rating2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
                rating3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
                rating4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
                rating5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
            }
        }
    ]);

    if (stats.length === 0) {
        return {
            total: 0,
            averageRating: 0,
            distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        };
    }

    return {
        total: stats[0].total,
        averageRating: Math.round(stats[0].avgRating * 10) / 10,
        distribution: {
            1: stats[0].rating1,
            2: stats[0].rating2,
            3: stats[0].rating3,
            4: stats[0].rating4,
            5: stats[0].rating5,
        }
    };
};

module.exports = {
    createReview,
    findReviewByUserAndProduct,
    getReviewsByProductId,
    findReviewById,
    updateReviewById,
    deleteReviewById,
    getReviewedProductIdsByUser,
    getReviewStats,
};
