const mongoose = require("mongoose");

// Định nghĩa các trạng thái đơn hàng phổ biến
const ORDER_STATUS_ENUM = [
    "pending",
    "confirmed",
    "shipping",
    "delivered",
    "cancelled", // Thêm trạng thái này cho đầy đủ
    "returned", // Thêm trạng thái này cho đầy đủ
];

const OrderSchema = new mongoose.Schema(
    {
        // Trường _id (PK) tự động được Mongoose/MongoDB tạo ra

        // Khóa ngoại: Người đặt hàng (FK → User)
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // Tham chiếu đến Model 'User'
            required: true,
            index: true, // Index để truy vấn đơn hàng theo người dùng
        },

        // Khóa ngoại: Địa chỉ giao hàng cố định (FK → Address)
        // Địa chỉ này nên là bản sao của Address lúc đặt hàng để tránh thay đổi sau này
        addressId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Address", // Tham chiếu đến Model 'Address'
            required: true,
        },

        // Khóa ngoại: Mã giảm giá đã sử dụng (nullable)
        discountCodeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "DiscountCode", // Tham chiếu đến Model 'DiscountCode'
            default: null,
        },

        // Tổng tiền cuối cùng (sau giảm giá và trừ điểm)
        // Sử dụng Decimal128 cho độ chính xác tiền tệ
        totalAmount: {
            type: mongoose.Schema.Types.Decimal128,
            required: true,
            min: 0,
        },

        // Điểm thưởng đã sử dụng để thanh toán
        pointsUsed: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
        },

        // Điểm thưởng tích được từ đơn hàng này
        pointsEarned: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
        },

        deliveryType: {
            type: String,
            enum: ["standard", "express"],
            default: "standard"
        },

        shippingFee: {
            type: Number,
            default: 0,
        },

        // Trạng thái hiện tại của đơn hàng
        status: {
            type: String,
            enum: ORDER_STATUS_ENUM, // Giới hạn giá trị
            default: "pending",
            required: true,
            lowercase: true,
        },

        // createdAt / updatedAt (Tự động)
    },
    {
        timestamps: true, // Tự động thêm createdAt và updatedAt
    },
);

// Tạo Model từ Schema
module.exports = mongoose.model("Order", OrderSchema);
