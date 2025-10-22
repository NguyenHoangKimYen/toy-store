const mongoose = require('mongoose');

const ProductVariantSchema = new mongoose.Schema({
  // Trường _id (PK) tự động được Mongoose/MongoDB tạo ra
  
  // Khóa ngoại: Sản phẩm cha (FK → Product)
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product', // Tham chiếu đến Model 'Product'
    required: true,
    index: true, // Index để tìm nhanh các biến thể của một sản phẩm
  },
  
  // Tên biến thể (Ví dụ: “Xanh”, “Size L”, “Gói 500g”)
  name: {
    type: String,
    required: true,
    trim: true,
  },
  
  // Mã SKU (Stock Keeping Unit) - Mã sản phẩm duy nhất
  sku: {
    type: String,
    required: true,
    unique: true, // Mã SKU phải là duy nhất trong toàn bộ hệ thống
    uppercase: true,
    trim: true,
  },
  
  // Giá của biến thể (Sử dụng Decimal128 cho độ chính xác)
  price: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
    min: 0,
  },
  
  // Số lượng tồn kho
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  
  // Danh sách URL ảnh của riêng biến thể này
  images: [{
    type: String, // Lưu trữ URL ảnh
    trim: true,
  }],
  
}, {
  timestamps: true, // Tự động thêm createdAt và updatedAt
});

// Tạo Model từ Schema
module.exports = mongoose.model('ProductVariant', ProductVariantSchema);