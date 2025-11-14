// Khai báo thư viện cần sử dụng
const dotenv = require('dotenv'); // Thư viện dotenv để quản lý biến môi trường
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const cors = require('cors');
const express = require('express'); //Thư viện express là framework của NodeJS để xây dựng web
const session = require("express-session");
const connectDB = require('./config/db.js');
const passportGoogle = require("./config/passportGoogle.js");

const app = express();  // Tạo app

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(`➡️ ${req.method} ${req.originalUrl} → ${res.statusCode} (${Date.now() - start}ms)`);
  });
  next();
});

// Middlewares
app.use(express.json()); // Cho phép phân tích cú pháp JSON trong body của request
app.use(express.urlencoded({ extended: true })); // Cho phép phân tích cú pháp URL-encoded trong body của request

app.use(cors({
  origin: [
    process.env.FRONTEND_URL, 'http://localhost:5173',
    'https://milkybloomtoystore.id.vn',
    'https://d1qc4bz6yrxl8k.cloudfront.net',
  ],
  credentials: true,
}));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "milkybloom_secret",
    resave: false,
    saveUninitialized: false,
  })
);

//thêm passportFacebook

app.use(passportGoogle.initialize());
app.use(passportGoogle.session());
app.use((req, res, next) => { //trình duyệt luôn dùng https
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  next();
});


app.get('/verify-email', (req, res) => {
  const qs = new URLSearchParams(req.query).toString();
  res.redirect(302, `/api/auth/verify-email?${qs}`);
});


// Import routes
// Cần bao nhiêu routes thì import bấy nhiêu
const productRoutes = require('./routes/product.route.js');
const userRoutes = require('./routes/user.route.js');
const authRoutes = require('./routes/auth.route.js');
const addressRoutes = require('./routes/address.route.js');
const shippingRoutes = require('./routes/shipping.route.js');
const paymentRoutes = require('./routes/payment.route.js');

// Gán các routes vào đường dẫn
app.use(passportGoogle.initialize());
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/shipping', shippingRoutes); // có thể rút ngắn lại
app.use('/api/payments', paymentRoutes);

app.get('/', (req, res) => {
  res.status(200).json({ message: 'MilkyBloom backend is running on AWS 🚀' });
});

app.use((err, req, res, _next) => { // xử lý lỗi tổng quát
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

app.get('/privacy', (req, res) => {
  res.send('<h2>MilkyBloom Privacy Policy</h2><p>We respect your privacy...</p>');
});

app.get('/delete-data', (req, res) => {
  res.send('<h2>Data Deletion</h2><p>Contact vxq123@icloud.com to request deletion.</p>');
});


// Kết nối db
const startServer = async () => {
  // Chờ kết nối db trước
  await connectDB();

  // Sau đó, chỉ start server khi đã kết nối được db
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log('MONGO_URI:', process.env.MONGO_URI);
  });
};

startServer();