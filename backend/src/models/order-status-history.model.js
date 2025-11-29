const mongoose = require('mongoose');

const ORDER_STATUS_ENUM = [
    'pending',
    'confirmed',
    'shipping',
    'delivered',
    'cancelled',
    'returned',
];

const OrderStatusHistorySchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order', // Tham chiếu đến Model 'Order'
        required: true,
        index: true, // Nên tạo index để truy vấn lịch sử của một đơn hàng nhanh chóng
    },

    // Tình trạng mới của đơn hàng
    status: {
        type: String,
        enum: ORDER_STATUS_ENUM, // Giới hạn giá trị trong mảng đã định nghĩa
        required: true,
        lowercase: true,
    },

    // Thời điểm thay đổi trạng thái
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Thêm index kết hợp trên orderId và updatedAt để có thể sắp xếp và truy vấn nhanh
OrderStatusHistorySchema.index({ orderId: 1, updatedAt: -1 });

// Tạo Model từ Schema
module.exports = mongoose.model('OrderStatusHistory', OrderStatusHistorySchema);
