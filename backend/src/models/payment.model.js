const mongoose = require('mongoose');

// Định nghĩa các phương thức thanh toán có thể có
const PAYMENT_METHOD_ENUM = [
    "momo",
    "zalopay",
    "vietqr",
    "cashondelivery", // Thanh toán tiền mặt
];

// Định nghĩa các trạng thái thanh toán
const PAYMENT_STATUS_ENUM = [
    'pending', // Đang chờ thanh toán
    'success', // Thanh toán thành công
    'failed', // Thanh toán thất bại
    'refunded', // Đã hoàn tiền (có thể cần thiết)
];

const PaymentSchema = new mongoose.Schema(
    {
        // Trường _id (PK) tự động được Mongoose/MongoDB tạo ra

        // Khóa ngoại: Đơn hàng được thanh toán (FK → Order)
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order', // Tham chiếu đến Model 'Order'
            required: true,
            unique: true, // Thường mỗi đơn hàng chỉ có một bản ghi thanh toán cuối cùng
        },

        // Phương thức thanh toán
        method: {
            type: String,
            enum: PAYMENT_METHOD_ENUM,
            required: true,
            lowercase: true,
        },

        // Trạng thái thanh toán
        status: {
            type: String,
            enum: PAYMENT_STATUS_ENUM,
            default: 'pending',
            required: true,
            lowercase: true,
        },

        // Mã giao dịch từ cổng thanh toán (hoặc mã tham chiếu COD)
        transactionId: {
            type: String,
            trim: true,
            default: null,
            // Nên unique nếu transactionId không phải là null
            // unique: true,
            // sparse: true, // Cho phép nhiều giá trị null, nhưng đảm bảo chuỗi không trùng
        },

        // Thời điểm thanh toán thành công
        paidAt: {
            type: Date,
            default: null, // Chỉ được đặt khi status là 'success'
        },

        // Tự động thêm createdAt / updatedAt (thời điểm tạo và cập nhật bản ghi thanh toán)
    },
    {
        timestamps: true,
    },
);

// Tạo Model từ Schema
module.exports = mongoose.model('Payment', PaymentSchema);
