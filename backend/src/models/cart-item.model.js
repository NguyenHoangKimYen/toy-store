const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
  // Khóa ngoại: Giỏ hàng chứa mục này (FK → Cart)
  cartId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cart',
    required: true,
  },

  // Khóa ngoại: Sản phẩm được thêm vào giỏ hàng (FK → Product)
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },

  // Số lượng sản phẩm trong giỏ hàng
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },

  // Giá tại thời điểm thêm vào giỏ hàng (nên lưu lại để tránh thay đổi theo giá hiện tại)
  price: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
    min: 0,
  },
});

// Đảm bảo một sản phẩm chỉ xuất hiện một lần trong một giỏ hàng
CartItemSchema.index({ cartId: 1, productId: 1 }, { unique: true });

module.exports = mongoose.model('CartItem', CartItemSchema);
