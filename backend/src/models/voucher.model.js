const mongoose = require('mongoose');
// Voucher model tương tự DiscountCode nhưng dành cho các voucher chung, không cá nhân hóa
//user lưu trữ voucher đã được người dùng nhận
const voucherSchema = new mongoose.Schema(
    {
        name: String,
        type: { type: String, enum: ['percent', 'fixed'] },
        value: Number,
        maxDiscount: Number,
        minOrderValue: Number,
        usagePerUser: Number,
        startDate: Date,
        endDate: Date,
        isActive: Boolean,
        isCollectable: Boolean, // như Shopee collect voucher
        eventId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Event',
            default: null,
        },
    },
    { timestamps: true },
);

module.exports = mongoose.model('Voucher', voucherSchema);
