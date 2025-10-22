const mongoose = require('mongoose');

const AnalyticsLogSchema = new mongoose.Schema({
  // Trường _id (PK) tự động được Mongoose/MongoDB tạo ra
  
  // Ngày của dữ liệu phân tích
  date: {
    type: Date,
    required: true,
    unique: true, // Đảm bảo chỉ có một bản ghi log cho mỗi ngày
    index: true,
  },
  
  // Tổng số đơn hàng trong ngày
  totalOrders: {
    type: Number,
    required: true,
    default: 0,
  },
  
  // Tổng doanh thu (Sử dụng Decimal128 để đảm bảo độ chính xác cho tiền tệ)
  totalRevenue: {
    type: mongoose.Schema.Types.Decimal128, 
    required: true,
    default: 0.00,
  },
  
  // Tổng lợi nhuận
  totalProfit: {
    type: mongoose.Schema.Types.Decimal128,
    required: true,
    default: 0.00,
  },
  
  // Danh sách ID của các sản phẩm bán chạy nhất (tham chiếu tới Product Model)
  bestSellingProductIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product', // Tham chiếu tới Model 'Product'
  }],
});

// Tạo Model từ Schema
module.exports = mongoose.model('AnalyticsLog', AnalyticsLogSchema);