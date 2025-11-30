const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
            index: true,
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },

        // Link to the specific order item being reviewed (one review per order item)
        orderItemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'OrderItem',
            required: true,
            unique: true, // Ensures one review per order item
        },

        variantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Variant',
            required: true,
        },

        variantName: {
            type: String,
            required: true,
            trim: true,
        },

        imageUrls: {
            type: [String],
            validate: [arrayLimit, '{PATH} exceeds the limit of 5 images'],
            default: [],
        },

        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
            default: 5,
        },

        comment: {
            type: String,
            trim: true,
            maxlength: 500,
        },

        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected', 'flagged'],
            default: 'pending',
            index: true,
        },

        aiAnalysis: {
            isSafe: { type: Boolean, default: null }, // AI đánh giá an toàn không
            toxicScore: { type: Number, default: 0 }, // Điểm độc hại (0-1)
            flaggedCategories: [String], // Ví dụ: ["spam", "harassment"]
            processedAt: Date,
        },

        moderatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Admin nào duyệt
            default: null,
        },

        moderatedAt: Date,
        rejectionReason: String,

        // Helpful/Likes tracking
        helpfulUsers: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: 'User',
            default: [],
        },

        helpfulCount: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    {
        timestamps: true,
        collection: 'reviews',
    },
);

// --- INDEX ---
// orderItemId already has unique: true in schema
ReviewSchema.index({ productId: 1, status: 1 }); // For fetching approved reviews by product

// --- STATICS: TÍNH TOÁN RATING TRUNG BÌNH ---
ReviewSchema.statics.calcAverageRatings = async function (productId) {
    const stats = await this.aggregate([
        {
            $match: { productId: productId },
        },
        {
            $group: {
                _id: '$productId',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' },
            },
        },
    ]);

    if (stats.length > 0) {
        await mongoose.model('Product').findByIdAndUpdate(productId, {
            averageRating: Math.round(stats[0].avgRating * 10) / 10,
        });
    } else {
        await mongoose.model('Product').findByIdAndUpdate(productId, {
            averageRating: 0,
        });
    }
};

// --- MIDDLEWARE ---
ReviewSchema.post('save', function () {
    this.constructor.calcAverageRatings(this.productId);
});

// Validator giới hạn mảng
function arrayLimit(val) {
    return val.length <= 5;
}

module.exports = mongoose.model('Review', ReviewSchema);
