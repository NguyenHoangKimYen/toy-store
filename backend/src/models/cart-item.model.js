const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
  // Trường _id (PK) tự động được Mongoose/MongoDB tạo ra
  
  // Khóa ngoại: Giỏ hàng chứa mục này (FK → Cart)
  cartId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cart', // Tham chiếu đến Model 'Cart'
    required: true,
  },
  
  // Khóa ngoại: Phiên bản sản phẩm được thêm vào giỏ hàng (FK → ProductVariant)
  productVariantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductVariant', // Tham chiếu đến Model 'ProductVariant'
    required: true,
  },
  
  // Số lượng sản phẩm trong giỏ hàng
  quantity: {
    type: Number,
    required: true,
    min: 1, // Đảm bảo số lượng luôn lớn hơn hoặc bằng 1
  },
  
  // Giá của sản phẩm tại thời điểm được thêm vào giỏ hàng (nên dùng Decimal128)
  price: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
    min: 0,
  },
});

// Thêm index kết hợp để đảm bảo mỗi biến thể sản phẩm chỉ có 1 dòng trong 1 giỏ hàng
CartItemSchema.index({ cartId: 1, productVariantId: 1 }, { unique: true });

module.exports = mongoose.model('CartItem', CartItemSchema);