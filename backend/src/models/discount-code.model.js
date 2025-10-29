const mongoose = require('mongoose');

const DiscountCodeSchema = new mongoose.Schema({
  // Trường _id (PK) tự động được Mongoose/MongoDB tạo ra

  // Mã giảm giá (Ví dụ: 5 ký tự)
  code: {
    type: String,
    required: true,
    unique: true, // Mã giảm giá phải là duy nhất
    uppercase: true, // Nên chuyển thành chữ hoa để dễ quản lý
    trim: true,
    minlength: 5,
    maxlength: 5,
  },

  // Giá trị giảm (VND hoặc %)
  // Sử dụng Decimal128 cho độ chính xác khi tính toán tiền tệ
  value: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
    min: 0,
  },

  // Giới hạn lượt sử dụng
  usageLimit: {
    type: Number,
    required: true,
    default: 1,
    max: 10, // Giới hạn lượt dùng tối đa là 10 (theo yêu cầu)
    min: 1,
  },

  // Số lần đã được sử dụng
  usedCount: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
    // Trong logic nghiệp vụ, bạn phải đảm bảo usedCount không vượt quá usageLimit
  },

  // Khóa ngoại: Người quản trị tạo mã (FK → Admin/User)
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Tham chiếu đến Model 'User'
    required: true,
    // Trong logic nghiệp vụ, bạn sẽ kiểm tra role của User này là 'admin'
  },

}, {
  timestamps: { createdAt: 'createdAt', updatedAt: false },
});

module.exports = mongoose.model('DiscountCode', DiscountCodeSchema);