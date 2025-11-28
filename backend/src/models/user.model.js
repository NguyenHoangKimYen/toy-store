const mongoose = require('mongoose');
require('./address.model.js');

const ROLE_ENUM = ['customer', 'admin'];

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true,
        },

        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        phone: {
            type: String,
            required: function () {
                return !this.socialProvider;
            },
            sparse: true,
            default: null,
        },

        password: {
            type: String,
            select: false,
        },

        avatar: {
            type: String,
            trim: true,
            default: process.env.DEFAULT_AVATAR_URL,
        },

        // Password reset
        resetTokenHash: { type: String, select: false, default: null },
        resetTokenExpiresAt: { type: Date, default: null },
        resetOtpHash: { type: String, select: false, default: null },
        resetOtpExpiresAt: { type: Date, default: null },

        // Role
        role: {
            type: String,
            enum: ROLE_ENUM,
            default: 'customer',
            set: (value) => (ROLE_ENUM.includes(value) ? value : 'customer'),
        },

        isVerified: { type: Boolean, default: false },

        defaultAddressId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Address',
            default: null,
        },

        socialProvider: {
            type: String,
            enum: ['google', 'facebook', 'github', 'apple', null],
            default: null,
        },

        socialId: { type: String, default: null, index: true },

        // Loyalty system
        loyaltyRank: {
            type: String,
            enum: ['none', 'silver', 'gold', 'diamond'],
            default: 'none',
        },

        loyaltyPoints: {
            type: Number,
            default: 0,
            min: 0,
        },

        lifetimeSpent: {
            type: Number,
            default: 0,
        },

        spentLast12Months: {
            type: Number,
            default: 0,
        },

        badges: [
            {
                badgeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Badge' },
                receivedAt: Date,
            },
        ],

        // Change Email / Phone
        changeEmailOldOtpHash: { type: String, select: false, default: null },
        changeEmailOldOtpExpiresAt: { type: Date, default: null },
        pendingNewEmail: { type: String, default: null },
        verifyNewEmailTokenHash: { type: String, select: false, default: null },
        verifyNewEmailExpiresAt: { type: Date, default: null },

        changePhoneOtpHash: { type: String, select: false, default: null },
        changePhoneOtpExpiresAt: { type: Date, default: null },
        pendingPhone: { type: String, default: null },

        failLoginAttempts: { type: Number, default: 0 },
    },
    {
        timestamps: true,
        collection: 'users',
    },
);

// Cho phép setters chạy khi dùng update
userSchema.set('settersOnQuery', true);

// 🔥 TEXT INDEX - bắt buộc để /users?keyword hoạt động
userSchema.index({
    fullName: 'text',
    username: 'text',
    email: 'text',
    phone: 'text',
});

module.exports = mongoose.model('User', userSchema);
