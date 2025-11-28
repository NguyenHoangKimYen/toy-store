const mongoose = require('mongoose');

const DiscountCodeSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
            minlength: 5,
            maxlength: 5,
        },

        value: {
            type: mongoose.Schema.Types.Decimal128,
            required: true,
            min: 0,
        },

        usageLimit: {
            type: Number,
            required: true,
            default: 1,
            max: 10,
            min: 1,
        },

        usedCount: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        /**
         * NEW: Restrict coupon by loyalty tier
         * none     → everyone
         * silver   → silver, gold, diamond
         * gold     → gold, diamond
         * diamond  → diamond only
         */
        requiredTier: {
            type: String,
            enum: ['none', 'silver', 'gold', 'diamond'],
            default: 'none',
        },

        // NEW: Ngày hết hạn mã
        expiresAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: { createdAt: 'createdAt', updatedAt: false },
    },
);

module.exports = mongoose.model('DiscountCode', DiscountCodeSchema);
