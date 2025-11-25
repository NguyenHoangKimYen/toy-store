const router = require("express").Router();

const {
  createVietQR,
  customerConfirmVietQR,     // KH bấm "Tôi đã chuyển khoản"
  getPendingVietQROrders,    // Admin xem DS đang chờ xác nhận
  adminConfirmVietQR,        // Admin xác nhận đã nhận tiền
  adminRejectVietQR,         // Admin từ chối thanh toán

  createMomoPayment,
  momoIpn,
  momoReturn,

  createZaloPayOrder,
  zaloPayCallback,
  paymentSuccess,
} = require("../controllers/payment.controller.js");

const auth = require("../middlewares/auth.middleware.js");
const adminOnly = require("../middlewares/admin.middleware.js");

// ===================== VIETQR =====================
router.get("/vietqr/:orderId", createVietQR);

// KHÁCH HÀNG bấm "Đã chuyển khoản"
router.post("/vietqr/customer-confirm/:orderId", customerConfirmVietQR);

// ADMIN lấy danh sách đơn đang chờ xác nhận
router.get("/vietqr/admin/pending", auth, adminOnly, getPendingVietQROrders);

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

// ===================== MOMO =====================
router.post("/momo/:orderId", createMomoPayment);
router.post("/momo/ipn", momoIpn);
router.get("/momo/return", momoReturn);

// ===================== ZALOPAY =====================
router.post("/zalopay/:orderId", createZaloPayOrder);
router.post("/zalopay/callback", zaloPayCallback);

router.get("/success", paymentSuccess);

module.exports = router;
