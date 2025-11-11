const mongoose = require('mongoose');
require('./address.model.js');

const ROLE_ENUM = ["customer", "admin"];

const userSchema = new mongoose.Schema({
    //image url
    fullName: {
        type: String,
        required: true,
        trim: true
    },

    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
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
            return !this.socialProvider; //đăng nhập mxh không bắt buộc phone
        },
        sparse: true,
        default: null,
    },

        // Mật khẩu (dạng hashed) - Không bắt buộc nếu đăng nhập bằng mxh
        //Lưu hash
        password: {
            type: String,
            select: false, // Mặc định không trả về trường này khi truy vấn
        },

    avatar: {
        type: String,
        trim: true,
        default: process.env.DEFAULT_AVATAR_URL
    },

        // reset token (link) – lưu dạng hash + hạn
        resetTokenHash: {
            type: String,
            select: false,
            default: null,
        },

    resetTokenExpiresAt: {
        type: Date,
        default: null
    },

    //otp để đặt lại mật khẩu 
    resetOtpHash: {
        type: String,
        select: false,
        default: null
    },

        resetOtpExpiresAt: {
            type: Date,
            default: null,
        },

        role: {
            type: String,
            enum: ROLE_ENUM,
            default: "customer",
            required: true,
            set: (value) => {
                const allowedRoles = ROLE_ENUM;
                if (allowedRoles.includes(value)) {
                    return value;
                }
                return "customer"; // Mặc định là 'customer' nếu giá trị không hợp lệ
            },
        },

        isVerified: {
            type: Boolean,
            default: false,
        },

        defaultAddressId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Address",
            default: null,
        },

    socialProvider: {
        type: String,
        enum: ['google', 'facebook', 'github', 'apple', null],
        default: null,
    },

        socialId: {
            type: String,
            default: null,
            index: true,
        },

        // Điểm thưởng hiện tại
        loyaltyPoints: {
            type: Number,
            default: 0,
            min: 0,
        },
        // đăng nhập thất bại
        failLoginAttempts: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
        collection: "users",
    },
);

userSchema.set("settersOnQuery", true); //cho phép sử dụng setter khi update

module.exports = mongoose.model('User', userSchema);
