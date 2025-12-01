const router = require('express').Router();

const {
    createVietQR,
    customerConfirmVietQR, // KH bấm "Tôi đã chuyển khoản"
    getPendingVietQROrders, // Admin xem DS đang chờ xác nhận
    adminConfirmVietQR, // Admin xác nhận đã nhận tiền
    adminRejectVietQR, // Admin từ chối thanh toán

    createMomoPayment,
    momoIpn,
    momoReturn,

  createZaloPayOrder,
  zaloPayCallback,
  zaloPayReturn,
  paymentSuccess,
  payByCash,
} = require("../controllers/payment.controller.js");

const auth = require('../middlewares/auth.middleware.js');
const adminOnly = require('../middlewares/admin.middleware.js');

// ===================== VIETQR =====================
router.get('/vietqr/:orderId', createVietQR);

// KHÁCH HÀNG bấm "Đã chuyển khoản"
router.post('/vietqr/customer-confirm/:orderId', customerConfirmVietQR);

// ADMIN lấy danh sách đơn đang chờ xác nhận
router.get('/vietqr/admin/pending', auth, adminOnly, getPendingVietQROrders);

// ADMIN xác nhận đã nhận tiền
router.post(
    "/vietqr/admin/:orderId/confirm",
    auth,
    adminOnly,
    adminConfirmVietQR,
);

// ADMIN từ chối thanh toán
router.post(
    "/vietqr/admin/:orderId/reject",
    auth,
    adminOnly,
    adminRejectVietQR,
);

// ===================== CASH (COD) =====================
// Cho phép khách/FE gọi để chọn thanh toán tiền mặt (không yêu cầu đăng nhập)
router.post("/cash/:orderId", payByCash);

// ===================== MOMO =====================
router.post("/momo/:orderId", createMomoPayment);
router.post("/momo/ipn", momoIpn);
router.get("/momo/return", momoReturn);

// ===================== ZALOPAY =====================
router.post("/zalopay/:orderId", createZaloPayOrder);
router.post("/zalopay/callback", zaloPayCallback);
router.get("/zalopay/return", zaloPayReturn);

// Payment success routes - handle both patterns
router.get("/success", paymentSuccess);
router.get("/success/payment/:orderId", paymentSuccess); // Handle redirect URL pattern

module.exports = router;
