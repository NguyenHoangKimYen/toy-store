const path = require("path");
require("dotenv").config({
    path: path.resolve(__dirname, "../../.env"),
});

const axios = require("axios");
const qs = require("qs");

const orderRepository = require('../repositories/order.repository');
const { buildRawSignature, generateSignature } = require('../utils/momo.helper');
const { hmacSHA256 } = require('../utils/zalopay.helper');
const { updateStatus: updateOrderStatus } = require('./order.service');

const MOMO_CONFIG = {
    partnerCode: process.env.MOMO_PARTNER_CODE,
    accessKey: process.env.MOMO_ACCESS_KEY,
    secretKey: process.env.MOMO_SECRET_KEY,
    endpoint: process.env.MOMO_ENDPOINT,
    redirectUrl: process.env.MOMO_REDIRECT_URL,
    ipnUrl: process.env.MOMO_IPN_URL,
};

const ZALOPAY_CONFIG = {
    appId: process.env.ZALOPAY_APP_ID,
    key1: process.env.ZALOPAY_KEY1,
    key2: process.env.ZALOPAY_KEY2,
    endpoint: process.env.ZALOPAY_ENDPOINT,
    redirectUrl: process.env.ZALOPAY_REDIRECT_URL,
    callbackUrl: process.env.ZALOPAY_CALLBACK_URL,
};

// ======================== MOMO PAYMENT ==========================

async function createMomoPayment(orderId) {
    try {
        const order = await orderRepository.findById(orderId);
        if (!order) throw new Error("Order not found");

        const amount = Number(order.totalAmount);
        if (!amount || amount < 1000) throw new Error("Invalid MoMo amount");

        const requestId = Date.now().toString();
        const momoOrderId = order._id.toString();
        const requestType = "payWithMethod";
        const orderInfo = `Payment for order ${momoOrderId}`; // Use English without special chars

        const signatureObj = {
            accessKey: MOMO_CONFIG.accessKey,
            amount,
            extraData: "",
            ipnUrl: MOMO_CONFIG.ipnUrl,
            orderId: momoOrderId,
            orderInfo,
            partnerCode: MOMO_CONFIG.partnerCode,
            redirectUrl: MOMO_CONFIG.redirectUrl,
            requestId,
            requestType,
        };

        const rawSignature = buildRawSignature(signatureObj);
        const signature = generateSignature(rawSignature, MOMO_CONFIG.secretKey);

        const payload = {
            ...signatureObj,
            signature,
            lang: "vi",
        };

        console.log("🔵 MoMo Request Payload:", JSON.stringify(payload, null, 2));

        const res = await axios.post(MOMO_CONFIG.endpoint, payload);
        const data = res.data;

        console.log("🟢 MoMo Response:", JSON.stringify(data, null, 2));

        if (!data || data.resultCode !== 0) {
            console.error("❌ MoMo Error Response:", data);
            throw new Error(
                `MoMo payment failed: ${data?.message || data?.localMessage || "Unknown error"}`,
            );
        }

        return {
            payUrl: data.payUrl,
            qrCode: data.qrCodeUrl || null,
            deeplink: data.deeplink || null,
            orderId: momoOrderId,
        };
    } catch (error) {
        // Handle axios errors
        if (error.response) {
            console.error("❌ MoMo API Error:", error.response.data);
            throw new Error(
                `MoMo API error: ${error.response.data?.message || error.response.data?.localMessage || error.message}`
            );
        }
        throw error;
    }
}

async function handleMomoIpn(body) {
    const { orderId, resultCode } = body;
    if (!orderId) return { success: false, message: "Missing orderId" };

    if (resultCode === 0) {
        await orderRepository.updatePaymentStatus(orderId, {
            paymentStatus: "paid",
            status: "confirmed",
        });
        return { success: true, message: "Payment success" };
    }

    await orderRepository.updatePaymentStatus(orderId, {
        paymentStatus: "failed",
        status: "cancelled",
    });

    return { success: false, message: "Payment failed" };
}

async function handleMomoReturn(query) {
    const { resultCode, orderId } = query;

    return {
        success: resultCode === "0",
        orderId,
        message: resultCode === "0" ? "Payment success" : "Payment failed",
    };
}

// ======================== ZALOPAY PAYMENT ==========================

async function createZaloPayOrderService(order) {
    const { appId, key1, endpoint, redirectUrl, callbackUrl } = ZALOPAY_CONFIG;

    const date = new Date();
    const yyMMdd = date.toISOString().slice(2, 10).replace(/-/g, "");
    const random = String(Math.floor(Math.random() * 999999)).padStart(6, "0");
    const apptransid = `${yyMMdd}_${random}`;

    const amount = parseInt(order.totalAmount?.toString() || "0", 10);
    const apptime = Date.now();
    const appuser = (order.userId || "guest_user").toString();
    
    // Build dynamic redirect URL with order ID
    const baseUrl = redirectUrl.replace(/\/payment\/success$/, '');
    const dynamicRedirectUrl = `${baseUrl}/payment/${order._id}`;
    
    const embeddata = JSON.stringify({
        redirecturl: dynamicRedirectUrl,
        orderId: order._id.toString(),
    });

    const item = JSON.stringify([]);

    const data = [
        appId,
        apptransid,
        appuser,
        amount,
        apptime,
        embeddata,
        item,
    ].join("|");

    const mac = hmacSHA256(data, key1);

    const payload = {
        appid: appId,
        appuser,
        apptime,
        amount,
        apptransid,
        embeddata,
        item,
        description: `MilkyBloom - Thanh toán đơn #${order._id}`,
        bankcode: "",
        callbackurl: callbackUrl,
        mac,
    };

    const zaloRes = await axios.post(endpoint, qs.stringify(payload), {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    // Lưu lại apptransid để map callback/return
    await orderRepository.updateById(order._id, {
        paymentMethod: "zalopay",
        zaloAppTransId: apptransid,
    });

    return zaloRes.data;
}

// ======================== VERIFY CALLBACK ==========================

function verifyZaloPayCallback(params) {
    // 👉 BỎ QUA VERIFY KHI KHÔNG Ở PRODUCTION
    if (process.env.NODE_ENV !== "production") {
        console.log("⚠️ [SANDBOX] Skip ZaloPay MAC verify");
        return true;
    }

    const reqMac = params.mac;
    const dataStr = typeof params.data === "string"
        ? params.data
        : JSON.stringify(params.data);

    const mac = hmacSHA256(dataStr, ZALOPAY_CONFIG.key2);
    return mac === reqMac;
}

async function handleZaloCallback(data) {
    const { orderId, return_code } = data;

    if (return_code === 1) {
        await orderRepository.updatePaymentStatus(orderId, {
            paymentStatus: "paid",
            paymentMethod: "zalopay",
        });
        await updateOrderStatus(orderId, "confirmed");
    } else {
        await orderRepository.updatePaymentStatus(orderId, {
            paymentStatus: "failed",
            paymentMethod: "zalopay",
        });
        await updateOrderStatus(orderId, "cancelled");
    }
}

module.exports = {
    createMomoPayment,
    handleMomoIpn,
    handleMomoReturn,
    createZaloPayOrderService,
    verifyZaloPayCallback,
    handleZaloCallback,
};
