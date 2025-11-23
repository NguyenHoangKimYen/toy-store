const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
            index: true,
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        variantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Variant",
            required: true,
        },

        variantName: {
            type: String,
            required: true,
            trim: true,
        },

        imageUrls: {
            type: [String],
            validate: [arrayLimit, "{PATH} exceeds the limit of 5 images"],
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
            enum: ["pending", "approved", "rejected", "flagged"],
            default: "pending",
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
            ref: "User", // Admin nào duyệt
            default: null,
        },

        moderatedAt: Date,
        rejectionReason: String,
    },
    {
        timestamps: true,
        collection: "reviews",
    },
);

// --- INDEX ---
ReviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

// --- STATICS: TÍNH TOÁN RATING TRUNG BÌNH ---
ReviewSchema.statics.calcAverageRatings = async function (productId) {
    const stats = await this.aggregate([
        {
            $match: { productId: productId },
        },
        {
            $group: {
                _id: "$productId",
                nRating: { $sum: 1 },
                avgRating: { $avg: "$rating" },
            },
        },
    ]);

    if (stats.length > 0) {
        await mongoose.model("Product").findByIdAndUpdate(productId, {
            averageRating: Math.round(stats[0].avgRating * 10) / 10,
        });
    } else {
        await mongoose.model("Product").findByIdAndUpdate(productId, {
            averageRating: 0,
        });
    }
};

// --- MIDDLEWARE ---
ReviewSchema.post("save", function () {
    this.constructor.calcAverageRatings(this.productId);
});

// Validator giới hạn mảng
function arrayLimit(val) {
    return val.length <= 5;
}

module.exports = mongoose.model("Review", ReviewSchema);
