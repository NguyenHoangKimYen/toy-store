const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true, //truy vấn nhanh hơn
        },

        fullNameOfReceiver: {
            type: String,
            required: true,
            trim: true,
        },

        phone: {
            type: String,
            required: true,
            trim: true,
        },

        addressLine: {
            type: String,
            required: true,
            trim: true,
        },

        city: {
            type: String,
            trim: true,
            default: null,
        },

        // Nếu không cần thì bỏ phần mã bưu chính
        postalCode: {
            type: String,
            trim: true,
            default: null,
        },

        lat: {
            //latitude (vi do Bac-Nam)
            type: Number,
            default: null,
        },

        lng: {
            //longtitude (kinh do Dong-Tay)
            type: Number,
            default: null,
        },

        // Đánh dấu địa chỉ mặc định
        isDefault: {
            type: Boolean,
            default: false,
        },
    },
    {
        collection: "addresses",
        timestamps: true,
    },
);

module.exports = mongoose.model('Address', addressSchema);
