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

  slug: {
    type: String,
    required: true,
    unique: true, // Slug phải là duy nhất
    lowercase: true,
    trim: true,
  },

  // Mô tả ngắn
  description: {
    type: String,
    trim: true,
    default: null, // Mô tả có thể không bắt buộc
  }
},
  {
    timestamps: true,
    collection: 'brands'
  }
);

module.exports = mongoose.model('Brand', BrandSchema);