const mongoose = require('mongoose');

const ROLE_ENUM = ['customer', 'admin'];

const userSchema = new mongoose.Schema({
    fullName: {
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

    // Mật khẩu (dạng hashed) - Không bắt buộc nếu đăng nhập bằng mxh
    password: {
        type: String
    },

    role: {
        type: String,
        enum: ROLE_ENUM,
        default: 'customer',
        required: true
    },

    defaultAddressId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address',
        default: null
    },

    socialProvider: {
        type: String,
        default: null
    },

    socialId: {
        type: String,
        default: ntru,
        // index: true
    },

    // Điểm thưởng hiện tại
    loyaltyPoints: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);