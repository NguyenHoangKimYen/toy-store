const mongoose = require('mongoose');

require('./cart-item.model');

const CartSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Cho phép null/undefined (khách vãng lai)
    default: null,
    // Nên tạo index độc nhất nếu userId tồn tại để 1 user chỉ có 1 cart
    unique: true, 
    sparse: true,
  },

  // ID phiên làm việc (Session ID) - Dùng cho khách vãng lai (guest checkout)
  sessionId: {
    type: String,
    required: function () {
      // Yêu cầu sessionId nếu userId không tồn tại
      return !this.userId;
    },
    trim: true,
  },

  items: {
    type: [mongoose.Schema.Types.ObjectId], // Mảng chứa các mục hàng
    default: [],
  },

  totalPrice: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
    default: 0.00,
  },

  discountCodeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DiscountCode', // Tham chiếu đến Model 'DiscountCode'
    default: null,
  },
}, {
  timestamps: true,
  collection: 'carts'
});

// Tạo index kết hợp để đảm bảo tính duy nhất:
// 1. Nếu có userId, chỉ có 1 cart (unique index trên userId)
// 2. Nếu không có userId, sessionId phải là duy nhất (unique index trên sessionId)
// Tuy nhiên, việc quản lý tính duy nhất này thường phức tạp hơn và nên xử lý ở tầng logic.
module.exports = mongoose.model('Cart', CartSchema); 