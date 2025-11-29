const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const CONNECTION_URL = process.env.MONGO_URI;

const connectDB = async () => {
    try {
        if (!CONNECTION_URL) {
            console.error(
                'ERROR: MONGO_URI is not defined in environment variables.',
            );
            process.exit(1);
        }

        const conn = await mongoose.connect(CONNECTION_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            // Những option này giúp Beanstalk tự động reconnect khi mạng AWS delay nhẹ
            serverSelectionTimeoutMS: 10000, // timeout sau 10s
            socketTimeoutMS: 45000, // giữ socket mở 45s
        });

        console.log(`MongoDB connected: ${conn.connection.host}`);

        // Nếu mất kết nối
        mongoose.connection.on("disconnected", () => {
            console.warn("MongoDB disconnected. Trying to reconnect...");
        });

        // Nếu có lỗi
        mongoose.connection.on("error", (err) => {
            console.error("MongoDB connection error:", err);
        });

        // Xử lý khi tắt server (Ctrl + C hoặc AWS deploy mới)
        process.on("SIGINT", async () => {
            await mongoose.connection.close();
            console.log(`✅ MongoDB connected: ${conn.connection.host}`);
            console.log(`📦 Database name: ${conn.connection.name}`);
            console.log("MongoDB connection closed due to app termination");
            process.exit(0);
        });
    } catch (error) {
        console.error(`MongoDB connection failed: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
