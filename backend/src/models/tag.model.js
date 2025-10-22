const mongoose = require('mongoose');

const TagSchema = new mongoose.Schema({
  // Trường _id (PK) tự động được Mongoose/MongoDB tạo ra
  
  // Tên tag (Ví dụ: “new”, “bestseller”, “sale”)
  name: {
    type: String,
    required: true,
    unique: true, // Đảm bảo tên tag là duy nhất
    trim: true,
    lowercase: true, // Nên chuẩn hóa tên tag thành chữ thường
  },
}, {
  timestamps: true, // Tùy chọn, có thể bỏ qua nếu không cần theo dõi thời gian tạo/cập nhật tag
});

// Tạo Model từ Schema
module.exports = mongoose.model('Tag', TagSchema);