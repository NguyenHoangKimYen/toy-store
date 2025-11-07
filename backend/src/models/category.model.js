const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  // Trường _id (PK) tự động được Mongoose/MongoDB tạo ra
  
  // Tên danh mục
  name: {
    type: String,
    required: true,
    unique: true, // Thường tên danh mục là duy nhất
    trim: true,
  },
  
  // Slug (Tên thân thiện với SEO)
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category', // Tham chiếu tới chính Model 'Category' (Self-reference)
    default: null, // Cho phép null (đây là danh mục gốc/cha)
  },
}, {
  timestamps: true, // Tự động thêm createdAt và updatedAt
  collection: 'categories'
});

module.exports = mongoose.model('Category', CategorySchema);