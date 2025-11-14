const orderRepository = require("../repositories/order.repository.js");
const { createVnpayUrl, verifyVnpayChecksum } = require("../utils/vnpay.helper.js");
const { generateVietQR } = require("../utils/vietqr.helper");

// Cấu hình
const VNPAY_CONFIG = {
  vnp_TmnCode: process.env.VNP_TMNCODE,
  vnp_HashSecret: process.env.VNP_HASHSECRET,
  vnp_Url: process.env.VNP_URL,
  vnp_ReturnUrl: process.env.VNP_RETURNURL,
};

// Lấy IP hợp lệ (fix cho AWS + local)
function getClientIp(req) {
  let ipAddr =
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.ip ||
    "";

  if (ipAddr.includes(",")) ipAddr = ipAddr.split(",")[0].trim();

  // VNPAY không chấp nhận 127.0.0.1 hoặc ::1
  if (ipAddr === "::1" || ipAddr === "127.0.0.1") {
    ipAddr = "42.112.31.12"; // IP hợp lệ (fake cũng được)
  }

  return ipAddr;
}

// =============================
// 1. USER TẠO URL THANH TOÁN
// =============================
exports.createPayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await orderRepository.findById(orderId);
    if (!order)
      return res.status(404).json({ success: false, message: "Order not found" });

    const ipAddr = getClientIp(req);

    const paymentUrl = createVnpayUrl(
      order._id.toString(),
      order.totalAmount,
      ipAddr,
      VNPAY_CONFIG
    );

    return res.json({
      success: true,
      paymentUrl,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =============================
// 2. RETURN URL TỪ VNPAY
// =============================
exports.vnpayReturn = async (req, res) => {
  try {
    const params = { ...req.query };

    const isValid = verifyVnpayChecksum(params, VNPAY_CONFIG.vnp_HashSecret);

    if (!isValid) {
      return res.json({ success: false, message: "Invalid checksum", params });
    }

    return res.json({
      success: true,
      message: "Payment success",
      data: params,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// =============================
// 3. VIETQR (không thay đổi)
// =============================
exports.createVietQR = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const order = await orderRepository.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const bank = "mb";
    const account = "195703200508";
    const amount = order.totalAmount;
    const addInfo = `MB_${order._id}`;

    const base = `https://img.vietqr.io/image/${bank}-${account}`;

    const qrUrls = {
      bill: `${base}-bill.png?amount=${amount}&addInfo=${encodeURIComponent(
        addInfo
      )}`,
    };

    return res.json({
      success: true,
      orderId: order._id,
      amount,
      addInfo,
      qr: qrUrls,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
