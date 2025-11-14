const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
    {
        // Trường _id (PK) tự động được Mongoose/MongoDB tạo ra

        // Khóa ngoại: Sản phẩm được đánh giá (FK → Product)
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product", // Tham chiếu đến Model 'Product'
            required: true,
            index: true, // Index để tìm nhanh các review của một sản phẩm
        },

        // Khóa ngoại: Người dùng thực hiện đánh giá (FK → User)
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // Tham chiếu đến Model 'User'
            default: null, // Cho phép null nếu là bình luận của khách vãng lai
        },

        // Nội dung đánh giá (Text)
        content: {
            type: String, // Lưu trữ nội dung dạng chuỗi dài
            required: true,
        },

        // createdAtdatetime (Tự động)
    },
    {
        timestamps: { createdAt: "createdAt", updatedAt: false }, // Chỉ cần createdAt
    },
);

// Tạo Model từ Schema
module.exports = mongoose.model("Review", ReviewSchema);
