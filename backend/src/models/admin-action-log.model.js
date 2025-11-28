const mongoose = require('mongoose');

const AdminActionLogSchema = new mongoose.Schema(
    {
        // Trường _id (PK) tự động được Mongoose/MongoDB tạo ra

        // Khóa ngoại: Người quản trị thực hiện hành động (FK → User)
        adminId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Tham chiếu đến Model 'User'
            required: true,
        },

        // Hành động (Ví dụ: 'create product', 'delete discount')
        action: {
            type: String,
            required: true,
            trim: true,
        },

        // Loại đối tượng bị tác động (Ví dụ: 'Product', 'Order', 'DiscountCode')
        targetType: {
            type: String,
            required: true,
            trim: true,
        },

        // ID của đối tượng bị tác động
        targetId: {
            type: String, // Hoặc mongoose.Schema.Types.ObjectId, tùy thuộc vào cách bạn lưu trữ ID
            required: true,
            trim: true,
        },

        // createdAtdatetime (Tự động)
    },
    {
        timestamps: { createdAt: 'createdAt', updatedAt: false }, // Chỉ cần createdAt
    },
);

module.exports = mongoose.model('AdminActionLog', AdminActionLogSchema);
