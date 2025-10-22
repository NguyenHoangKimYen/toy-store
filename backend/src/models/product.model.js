const mongoose = require('mongoose');

require('./brand.model.js');
require('./category.model.js');

const ProductSchema = new mongoose.Schema({
  // Trường _id (PK) tự động được Mongoose/MongoDB tạo ra
  
  // Tên sản phẩm
  name: {
    type: String,
    required: true,
    trim: true,
  },
  
  // Slug (Tên thân thiện với SEO)
  slug: {
    type: String,
    required: true,
    unique: true, // Slug phải là duy nhất
    lowercase: true,
    trim: true,
  },
  
  // Khóa ngoại: Thương hiệu (FK → Brand)
  brandId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand', // Tham chiếu đến Model 'Brand'
    required: true,
  },
  
  // Khóa ngoại: Danh mục (FK → Category)
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category', // Tham chiếu đến Model 'Category'
    required: true,
    index: true, // Index để tìm sản phẩm theo danh mục nhanh chóng
  },
  
  // Mô tả ngắn
  shortDescription: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500, // Giới hạn ký tự cho mô tả ngắn
  },
  
  // Mô tả chi tiết (Text)
  longDescription: {
    type: String, // Trong MongoDB, Text thường được lưu trữ dưới dạng String
    required: true,
  },
  
  // Mảng các Tag (Tham chiếu tới Tag Model)
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag', // Tham chiếu đến Model 'Tag'
  }],
  
  // Điểm trung bình (Dữ liệu tính toán từ bảng Rating/Review)
  averageRating: {
    type: Number, // Sử dụng Number (double) là đủ cho điểm số trung bình
    default: 0.0,
    min: 0,
    max: 5,
  },
  
  // createdAt / updatedAt (Tự động)
}, {
  timestamps: true, // Tự động thêm createdAt và updatedAt
});

// Tạo Model từ Schema
module.exports = mongoose.model('Product', ProductSchema);