const mongoose = require('mongoose');

require('./category.model.js');
require('./tag.model.js');

const ProductSchema = new mongoose.Schema({
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
    unique: true,
    lowercase: true,
    trim: true,
  },

  // Danh mục
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
    index: true,
  },

  // Mô tả ngắn
  shortDescription: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500,
  },

  // Mô tả chi tiết
  longDescription: {
    type: String,
    required: true,
  },

  // Danh sách tag
  tags: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tag',
    },
  ],

  // ✅ SKU (mã hàng hóa)
  sku: {
    type: String,
    trim: true,
    unique: true,
    sparse: true, // tránh lỗi unique khi để trống
  },

  // ✅ Giá bán
  price: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
    min: 0,
  },

  // ✅ Giá gốc (nếu có khuyến mãi)
  originalPrice: {
    type: mongoose.Schema.Types.Decimal128,
    default: null,
  },

  // ✅ Số lượng tồn kho
  stockQuantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },

  // ✅ Trạng thái còn hàng/hết hàng
  inStock: {
    type: Boolean,
    default: true,
  },

  // ✅ Điểm đánh giá trung bình
  averageRating: {
    type: Number,
    default: 0.0,
    min: 0,
    max: 5,
  },

  // ✅ Ảnh sản phẩm
  imageUrls: [
    {
      type: String,
      trim: true,
    },
  ],

  // ✅ Cờ xác định sản phẩm nổi bật, bán chạy, mới ra mắt, v.v.
  isNew: {
    type: Boolean,
    default: false,
  },
  isBestSeller: {
    type: Boolean,
    default: false,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },

}, {
  timestamps: true,
  collection: 'products',
});

module.exports = mongoose.model('Product', ProductSchema);
