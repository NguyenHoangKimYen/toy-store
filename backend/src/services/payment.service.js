const orderRepository = require('../repositories/order.repository');
const { createVnpayUrl, verifyVnpayChecksum } = require('../utils/vnpay.helper');
const Joi = require('joi');

// CONFIG
const VNPAY_CONFIG = {
    vnp_TmnCode: process.env.VNP_TMNCODE,
    vnp_HashSecret: process.env.VNP_HASHSECRET,
    vnp_Url: process.env.VNP_URL,
    vnp_ReturnUrl: process.env.VNP_RETURNURL,
    vnp_IpnUrl: process.env.VNP_IPNURL,
};

// VALIDATION
const createPaymentSchema = Joi.object({
    orderId: Joi.string().required(),
    method: Joi.string().valid('vnpay', 'cash', 'momo').required(),
});

// FIX IP — dùng IP hợp lệ theo VNPAY
function getClientIp(req) {
    let ip =
        req.headers["x-forwarded-for"] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.ip ||
        "";

    if (ip.includes(",")) ip = ip.split(",")[0].trim();
    if (ip.startsWith("::ffff:")) ip = ip.replace("::ffff:", "");
    if (ip === "::1" || ip === "127.0.0.1" || ip === "::") ip = "42.112.31.12";

    return ip;
}

// ================================
// 1. CREATE PAYMENT
// ================================
async function createVnpayPayment(req) {
    const { orderId } = req.body;

    const order = await orderRepository.findById(orderId);
    if (!order) throw new Error("Order not found");

    const ipAddr = getClientIp(req);

    const paymentUrl = createVnpayUrl(
        order._id.toString(),
        Number(order.totalAmount),
        ipAddr,
        VNPAY_CONFIG
    );

    return { paymentUrl };
}

// ================================
// 2. RETURN URL
// ================================
async function handleVnpayReturn(query) {
    const copyParams = { ...query };
    const isValid = verifyVnpayChecksum(copyParams, VNPAY_CONFIG.vnp_HashSecret);

    if (!isValid) throw new Error("Invalid checksum");

    const orderId = query.vnp_TxnRef;
    const rspCode = query.vnp_ResponseCode;

    const order = await orderRepository.findById(orderId);
    if (!order) throw new Error("Order not found");

    if (rspCode === "00") {
        await orderRepository.updatePaymentStatus(orderId, {
            paymentStatus: "paid",
            status: "processing",
            paymentMethod: "vnpay",
        });
    } else {
        await orderRepository.updatePaymentStatus(orderId, {
            paymentStatus: "failed",
            status: "cancelled",
        });
    }

    return { orderId, rspCode };
}

// ================================
// 3. IPN URL
// ================================
async function handleVnpayIpn(query) {
    const copyParams = { ...query };
    const isValid = verifyVnpayChecksum(copyParams, VNPAY_CONFIG.vnp_HashSecret);

    if (!isValid)
        return { RspCode: "97", Message: "Invalid Checksum" };

    const orderId = query.vnp_TxnRef;
    const rspCode = query.vnp_ResponseCode;

    const order = await orderRepository.findById(orderId);
    if (!order)
        return { RspCode: "01", Message: "Order not found" };

    if (order.paymentStatus === "paid")
        return { RspCode: "02", Message: "Order already confirmed" };

    if (rspCode === "00") {
        await orderRepository.updatePaymentStatus(orderId, {
            paymentStatus: "paid",
            status: "processing",
            paymentMethod: "vnpay",
        });
        return { RspCode: "00", Message: "Confirm Success" };
    }

    return { RspCode: "00", Message: "Confirm Failure" };
}

module.exports = {
    createVnpayPayment,
    handleVnpayReturn,
    handleVnpayIpn,
    createPaymentSchema,
};
