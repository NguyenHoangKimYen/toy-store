const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  // Trường _id (PK) tự động được Mongoose/MongoDB tạo ra
  
  // Khóa ngoại: Đơn hàng chứa mục này (FK → Order)
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order', // Tham chiếu đến Model 'Order'
    required: true,
  },
  
  // Khóa ngoại: Phiên bản sản phẩm được đặt hàng (FK → ProductVariant)
  productVariantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductVariant', // Tham chiếu đến Model 'ProductVariant'
    required: true,
  },
  
  // Số lượng sản phẩm được đặt
  quantity: {
    type: Number,
    required: true,
    min: 1, // Đảm bảo số lượng luôn lớn hơn hoặc bằng 1
  },
  
  // Giá bán của 1 sản phẩm tại thời điểm đặt hàng (Giá cố định)
  unitPrice: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
    min: 0,
  },
  
  // Tổng tiền cho mục này (quantity * unitPrice)
  subtotal: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
    min: 0,
  },
});

// Thêm index kết hợp để truy vấn nhanh các mục thuộc một đơn hàng cụ thể
OrderItemSchema.index({ orderId: 1, productVariantId: 1 });

// Tạo Model từ Schema
module.exports = mongoose.model('OrderItem', OrderItemSchema);