const mongoose = require("mongoose");

const dotenv = require("dotenv");

dotenv.config();

const CONNECTION_URL = process.env.MONGO_URI;

const connectDB = async () => {
    try {
        // Kiểm tra biến môi trường CONNECTION_URL có lấy được không
        if (!CONNECTION_URL) {
            console.error(
                "ERROR: MONGO_URI is not defined in environment variables.",
            );

            // Do thiếu cấu hình quan trọng, nên thoát ứng dụng
            process.exit(1);
        }

        // Đi vào lệnh kết nối
        const conn = await mongoose.connect(CONNECTION_URL); // Nếu cần sử dụng conn thì khai báo, không thì bỏ cũng được
        console.log(`MongoDB connected successfully: ${conn.connection.host}`); // Để sử dụng được ${...} thì phải dùng dấu `

    } catch (error) {
        // Bắt lỗi
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

// Quan trọng: phải xuất hàm thì file khởi động mới dùng được
module.exports = connectDB;
