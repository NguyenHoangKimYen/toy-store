// Khai báo thư viện cần sử dụng
const express = require('express'); //Thư viện express là framework của NodeJS để xây dựng web
const connectDB = require('./config/db.js');
const dotenv = require('dotenv');


dotenv.config();
const app = express();  // Tạo app

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(`➡️ ${req.method} ${req.originalUrl} → ${res.statusCode} (${Date.now()-start}ms)`);
  });
  next();
});

// Middlewares
app.use(express.json()); // Cho phép phân tích cú pháp JSON trong body của request
app.use(express.urlencoded({ extended: true })); // Cho phép phân tích cú pháp URL-encoded trong body của request

// Import routes
// Cần bao nhiêu routes thì import bấy nhiêu
const productRoutes = require('./routes/product.route.js');
const userRoutes = require('./routes/user.route.js');

// Gán các routes vào đường dẫn
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);


const PORT = process.env.PORT || 5000;

// Kết nối db
const startServer = async() => {
    // Chờ kết nối db trước
    await connectDB();

    // Sau đó, chỉ start server khi đã kết nối được db
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT} http://localhost:${PORT}/api/users`);
    })
};

startServer();