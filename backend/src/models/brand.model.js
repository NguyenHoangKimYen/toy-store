const mongoose = require('mongoose');

const BrandSchema = new mongoose.Schema({
  // Trường _id (PK) tự động được Mongoose/MongoDB tạo ra
  
  // Tên thương hiệu
  name: {
    type: String,
    required: true,
    unique: true, // Thường thì tên thương hiệu là duy nhất
    trim: true,
  },
  
  // Mô tả ngắn
  description: {
    type: String,
    trim: true,
    default: null, // Mô tả có thể không bắt buộc
  },
}, {
  timestamps: true, // Tự động thêm createdAt và updatedAt
});

// Tạo Model từ Schema
module.exports = mongoose.model('Brand', BrandSchema);