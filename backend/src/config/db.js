// BƯỚC 1: để kết nối với db thì phải liên kết
// khai báo thư viện mongoose
const mongoose = require('mongoose');

// khai báo thư viện dotenv để truy cập đến uri của db, vì cần bảo mật
const dotenv = require('dotenv');

// bắt đầu sử dụng file .env
dotenv.config();

// lấy đường dẫn db uri ra sử dụng
const CONNECTION_URL = process.env.MONGO_URI;

// kết nối với db
const connectDB = async () => {
    try {

        // Kiểm tra biến môi trường CONNECTION_URL có lấy được không
        if (!CONNECTION_URL) {
            console.error('ERROR: MONGO_URI is not defined in environment variables.');
            
            // Do thiếu cấu hình quan trọng, nên thoát ứng dụng
            process.exit(1);
        }

        // Đi vào lệnh kết nối 
        const conn = await mongoose.connect(CONNECTION_URL);    // Nếu cần sử dụng conn thì khai báo, không thì bỏ cũng được
        console.log(`MongoDB connected successfully: ${conn.connection.host}`);  // Để sử dụng được ${...} thì phải dùng dấu `

        // Thêm phần xử lý các sự kiện mongoose?
        // Xử lý lỗi sau khi kết nối thành công (ví dụ: mất kết nối)
        // Xử lý ngắt kết nối
        // Xử lý ngắt kết nối khi ứng dụng Node bị đóng (ví dụ: Ctrl+C)
    }
    catch (error) {
        // Bắt lỗi
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
}

// Quan trọng: phải xuất hàm thì file khởi động mới dùng được
module.exports = connectDB;
