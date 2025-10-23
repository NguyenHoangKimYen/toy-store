const mongoose = require('mongoose');
require ('./address.model.js');

const ROLE_ENUM = ['customer', 'admin'];

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },

    firstName:{
        type: String,
        required: true,
        trim: true
    },

    lastName:{
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    phone: {
        type: String,
        required: true,
        unique: true,
    },

    // Mật khẩu (dạng hashed) - Không bắt buộc nếu đăng nhập bằng mxh
    passwordHash: {
        type: String,
        select: false, // Mặc định không trả về trường này khi truy vấn
    },

    role: {
        type: String,
        enum: ROLE_ENUM,
        default: 'customer',
        required: true,
        set: (value) => {
            const allowedRoles = ROLE_ENUM;
            if (allowedRoles.includes(value)) {
                return value;
            }
            return 'customer'; // Mặc định là 'customer' nếu giá trị không hợp lệ
        }
    },

    isVerified: {
        type: Boolean,
        default: false
    },

    defaultAddressId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address',
        default: null
    },

    socialProvider: {
        type: String,
        enum: ['google', 'facebook', 'github', null],
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
    }
}, {
    timestamps: true,
    collection: 'users'
});

userSchema.set('settersOnQuery', true); //cho phép sử dụng setter khi update

module.exports = mongoose.model('User', userSchema);