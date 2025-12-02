const dotenv = require('dotenv');
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const crypto = require('crypto');
const os = require('os');
const cors = require('cors');
const express = require('express');
const compression = require('compression');
const http = require('http');
const session = require('express-session');
const connectDB = require('./config/db.js');
const passportGoogle = require('./config/passportGoogle.js');
const socket = require('./socket/index');
const { apiCacheMiddleware } = require('./middlewares/cache.middleware.js');

const app = express(); // Tạo app

// ============================================
// HORIZONTAL SCALING SUPPORT
// ============================================
// Generate unique instance ID for load balancing verification
const INSTANCE_ID = `${os.hostname()}-${crypto.randomBytes(4).toString('hex')}`;
console.log(`🏷️  Instance ID: ${INSTANCE_ID}`);

// Add instance ID to response headers (proves load balancing is working)
app.use((req, res, next) => {
    res.setHeader('X-Instance-ID', INSTANCE_ID);
    next();
});

// Enable ETag for conditional requests
app.set('etag', 'strong');

// Gzip/Brotli compression for all responses
app.use(compression({
    level: 6,
    threshold: 1024, // Only compress > 1KB
}));

// Request logging (only in development)
if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        const start = Date.now();
        res.on('finish', () => {
            console.log(
                `➡️ ${req.method} ${req.originalUrl} → ${res.statusCode} (${Date.now() - start}ms)`,
            );
        });
        next();
    });
}


app.use(cors({
  origin: [
    'http://localhost:5173',
     process.env.FRONTEND_URL,
    'https://www.milkybloomtoystore.id.vn',
    'https://milkybloomtoystore.id.vn',
    'https://d1qc4bz6yrxl8k.cloudfront.net',
    'https://api.milkybloomtoystore.id.vn',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
}));

// API Cache headers for better PageSpeed scores
app.use('/api', apiCacheMiddleware);

// ============================================
// SESSION CONFIGURATION (For OAuth flow only)
// ============================================
// NOTE: This app is STATELESS by design for horizontal scaling:
// - Authentication uses JWT tokens (stateless)
// - User data stored in MongoDB Atlas (shared)
// - Images stored in Cloudinary/S3 (shared)
// - Sessions only used temporarily during OAuth redirect flow
// For production with multiple instances, consider:
// - Using connect-mongo or connect-redis for session store
// - Or keep session: false in passport (already done)
app.use(
    session({
        secret: process.env.SESSION_SECRET || 'milkybloom_secret',
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === 'production',
            maxAge: 5 * 60 * 1000, // 5 minutes - only for OAuth flow
        },
    }),
);

//thêm passportFacebook
app.use(passportGoogle.initialize());
app.use(passportGoogle.session());

// Body parsers - skip for multipart/form-data (let multer handle it)
app.use((req, res, next) => {
    if (req.is('multipart')) {
        return next();
    }
    express.json({ limit: '50mb' })(req, res, next);
});

app.use((req, res, next) => {
    if (req.is('multipart')) {
        return next();
    }
    express.urlencoded({ extended: true, limit: '50mb' })(req, res, next);
});

app.use((req, res, next) => {
    //trình duyệt luôn dùng https
    res.setHeader(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload',
    );
    next();
});

app.get('/verify-email', (req, res) => {
    const qs = new URLSearchParams(req.query).toString();
    res.redirect(302, `/api/auth/verify-email?${qs}`);
});

// Import routes
// Cần bao nhiêu routes thì import bấy nhiêu
const productRoutes = require('./routes/product.route.js');
const variantRoutes = require('./routes/variant.route.js');
const userRoutes = require('./routes/user.route.js');
const authRoutes = require('./routes/auth.route.js');
const addressRoutes = require('./routes/address.route.js');
const shippingRoutes = require('./routes/shipping.route.js');
const paymentRoutes = require('./routes/payment.route.js');
const cartRoutes = require('./routes/cart.route.js');
const categoryRoutes = require('./routes/category.route.js');
const orderRoutes = require('./routes/order.route.js');
const reviewRoutes = require('./routes/review.route.js');
const commentRoutes = require('./routes/comment.route.js');
const loyaltyRoutes = require('./routes/loyalty.route.js');
const discountRoutes = require('./routes/discount-code.routes.js');
const monthlyJob = require('./utils/montly-loyalty.js');
const voucherRoutes = require('./routes/voucher.route.js');
const badgeRoutes = require("./routes/badge.route.js");
const dashboardRoutes = require('./routes/dashboard.routes.js');
const chatRoutes = require("./routes/chat.route.js");

const errorHandler = require('./middlewares/error.middleware');

require('./utils/event.cron.js');
monthlyJob();

// Gán các routes vào đường dẫn
app.use(passportGoogle.initialize());
app.use('/api/products', productRoutes);
app.use('/api/variants', variantRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/carts', cartRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/loyalty', loyaltyRoutes);
app.use('/api/discount', discountRoutes);
app.use('/api/vouchers', voucherRoutes);
app.use("/api/badges", badgeRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use("/api/chat", chatRoutes);

const server = http.createServer(app);
socket.init(server);

app.use(errorHandler);

// Health check endpoint for load balancer
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        instance: INSTANCE_ID,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
});

app.get('/', (req, res) => {
    res.status(200).json({
        message: 'MilkyBloom backend is running on AWS 🚀',
        instance: INSTANCE_ID,
        scalingReady: true,
    });
});

app.use((err, req, res, _next) => {
    const status = err.status || 500;
    res.status(status).json({
        success: false,
        message: err.message || 'Internal Server Error',
    });
});

app.get('/privacy', (req, res) => {
    res.send(
        '<h2>MilkyBloom Privacy Policy</h2><p>We respect your privacy...</p>',
    );
});

app.get('/delete-data', (req, res) => {
    res.send(
        '<h2>Data Deletion</h2><p>Contact vxq123@icloud.com to request deletion.</p>',
    );
});

// Kết nối db
const startServer = async () => {
    // Chờ kết nối db trước
    await connectDB();

    // Sau đó, chỉ start server khi đã kết nối được db
    const PORT = process.env.PORT || 8080;
    server.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`🎯 Instance: ${INSTANCE_ID}`);
        console.log(`📈 Horizontal scaling: READY`);
    });
};

startServer();
