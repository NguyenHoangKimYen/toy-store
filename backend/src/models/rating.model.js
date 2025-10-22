const mongoose = require('mongoose');

const RatingSchema = new mongoose.Schema({
  // Trường _id (PK) tự động được Mongoose/MongoDB tạo ra
  
  // Khóa ngoại: Sản phẩm được đánh giá (FK → Product)
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product', // Tham chiếu đến Model 'Product'
    required: true,
    index: true, // Index để tìm nhanh các rating của một sản phẩm
  },
  
  // Khóa ngoại: Người dùng thực hiện đánh giá (FK → User)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Tham chiếu đến Model 'User'
    required: true,
    index: true, // Index để tìm nhanh các rating của một người dùng
  },
  
  // Số sao (từ 1 đến 5)
  stars: {
    type: Number,
    required: true,
    min: 1, // Số sao tối thiểu là 1
    max: 5, // Số sao tối đa là 5
    // Thường là số nguyên (integer), nhưng không cần khai báo kiểu int
  },
  
  // createdAtdatetime (Tự động)
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: false }, // Chỉ cần createdAt
});

// Quan trọng: Đảm bảo mỗi người dùng chỉ đánh giá 1 lần trên 1 sản phẩm
RatingSchema.index({ productId: 1, userId: 1 }, { unique: true });

// Tạo Model từ Schema
module.exports = mongoose.model('Rating', RatingSchema);