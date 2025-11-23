const dotenv = require("dotenv");
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const cors = require("cors");
const express = require("express");
const http = require("http");
const session = require("express-session");
const connectDB = require("./config/db.js");
const passportGoogle = require("./config/passportGoogle.js");
const socket = require("./socket/index");

const app = express(); // Tạo app

app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
        console.log(
            `➡️ ${req.method} ${req.originalUrl} → ${res.statusCode} (${
                Date.now() - start
            }ms)`,
        );
    });
    next();
});

// Middlewares
app.use(express.json()); // Cho phép phân tích cú pháp JSON trong body của request
app.use(express.urlencoded({ extended: true })); // Cho phép phân tích cú pháp URL-encoded trong body của request

app.use(
    cors({
        origin: [
            "http://localhost:5173",
            process.env.FRONTEND_URL,
            "https://milkybloomtoystore.id.vn",
            "https://d1qc4bz6yrxl8k.cloudfront.net",
        ],
        credentials: true,
    }),
);

app.use(
    session({
        secret: process.env.SESSION_SECRET || "milkybloom_secret",
        resave: false,
        saveUninitialized: false,
    }),
);

//thêm passportFacebook

app.use(passportGoogle.initialize());
app.use(passportGoogle.session());
app.use((req, res, next) => {
    //trình duyệt luôn dùng https
    res.setHeader(
        "Strict-Transport-Security",
        "max-age=31536000; includeSubDomains; preload",
    );
    next();
});

app.get("/verify-email", (req, res) => {
    const qs = new URLSearchParams(req.query).toString();
    res.redirect(302, `/api/auth/verify-email?${qs}`);
});

// Import routes
// Cần bao nhiêu routes thì import bấy nhiêu
const productRoutes = require("./routes/product.route.js");
const variantRoutes = require("./routes/variant.route.js");
const userRoutes = require("./routes/user.route.js");
const authRoutes = require("./routes/auth.route.js");
const addressRoutes = require("./routes/address.route.js");
const shippingRoutes = require("./routes/shipping.route.js");
const paymentRoutes = require("./routes/payment.route.js");
const cartItemRoutes = require("./routes/cart-item.route.js");
const cartRoutes = require("./routes/cart.route.js");
const categoryRoutes = require("./routes/category.route.js");
const orderRoutes = require("./routes/order.route.js");
const reviewRoutes = require("./routes/review.route.js");
const loyaltyRoutes = require("./routes/loyalty.route.js");
const discountRoutes = require("./routes/discount-code.routes.js");
const monthlyJob = require("./utils/montly-loyalty.js");
const voucherRoutes = require("./routes/voucher.route.js");
const dashboardRoutes = require("./routes/dashboard.routes.js");

const errorHandler = require("./middlewares/error.middleware");

require("./utils/event.cron.js");
monthlyJob();

// Gán các routes vào đường dẫn
app.use(passportGoogle.initialize());
app.use("/api/products", productRoutes);
app.use("/api/variants", variantRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/shipping", shippingRoutes); // có thể rút ngắn lại
app.use("/api/payments", paymentRoutes);
app.use("/api/cart-items", cartItemRoutes);
app.use("/api/carts", cartRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/loyalty", loyaltyRoutes);
app.use("/api/discount", discountRoutes);
app.use("/api/vouchers", voucherRoutes);
app.use("/api/dashboard", dashboardRoutes);

const server = http.createServer(app);
socket.init(server);

app.use(errorHandler);

app.get("/", (req, res) => {
    res.status(200).json({
        message: "MilkyBloom backend is running on AWS 🚀",
    });
});

app.use((err, req, res, _next) => {
    // xử lý lỗi tổng quát
    const status = err.status || 500;
    res.status(status).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
});

app.get("/privacy", (req, res) => {
    res.send(
        "<h2>MilkyBloom Privacy Policy</h2><p>We respect your privacy...</p>",
    );
});

app.get("/delete-data", (req, res) => {
    res.send(
        "<h2>Data Deletion</h2><p>Contact vxq123@icloud.com to request deletion.</p>",
    );
});

// Kết nối db
const startServer = async () => {
    // Chờ kết nối db trước
    await connectDB();

    // Sau đó, chỉ start server khi đã kết nối được db
    const PORT = process.env.PORT || 8080;
    server.listen(PORT, "0.0.0.0", () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log("MONGO_URI:", process.env.MONGO_URI);
    });
};

startServer();
