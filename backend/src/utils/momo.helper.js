// src/utils/momo.helper.js
const crypto = require("crypto");

// Build raw signature string for MoMo
function buildRawSignature(params) {
    const {
        accessKey,
        amount,
        extraData,
        ipnUrl,
        orderId,
        orderInfo,
        partnerCode,
        redirectUrl,
        requestId,
        requestType,
    } = params;

    return (
        "accessKey=" +
        accessKey +
        "&amount=" +
        amount +
        "&extraData=" +
        extraData +
        "&ipnUrl=" +
        ipnUrl +
        "&orderId=" +
        orderId +
        "&orderInfo=" +
        orderInfo +
        "&partnerCode=" +
        partnerCode +
        "&redirectUrl=" +
        redirectUrl +
        "&requestId=" +
        requestId +
        "&requestType=" +
        requestType
    );
}

// Generate HMAC SHA256 signature
function generateSignature(rawSignature, secretKey) {
    console.log("🔐 Secret Key:", secretKey?.substring(0, 10) + "...");
    console.log("📝 Raw Signature Length:", rawSignature?.length);
    
    const sig = crypto
        .createHmac("sha256", secretKey)
        .update(rawSignature, "utf8")
        .digest("hex");
    
    console.log("✅ Generated Signature:", sig);
    return sig;
}

function createMomoSignatureForCreatePayment({
    accessKey,
    amount,
    extraData,
    ipnUrl,
    orderId,
    orderInfo,
    partnerCode,
    redirectUrl,
    requestId,
    requestType,
    secretKey,
}) {
    const rawSignature =
        "accessKey=" +
        accessKey +
        "&amount=" +
        amount +
        "&extraData=" +
        extraData +
        "&ipnUrl=" +
        ipnUrl +
        "&orderId=" +
        orderId +
        "&orderInfo=" +
        orderInfo +
        "&partnerCode=" +
        partnerCode +
        "&redirectUrl=" +
        redirectUrl +
        "&requestId=" +
        requestId +
        "&requestType=" +
        requestType;

    const signature = crypto
        .createHmac("sha256", secretKey)
        .update(rawSignature, "utf8")
        .digest("hex");

    return { rawSignature, signature };
}

// IPN: ở dev mình có thể bỏ verify, nhưng vẫn chuẩn bị hàm sẵn
function createMomoSignatureForIpn(params, secretKey) {
    const {
        accessKey,
        amount,
        extraData,
        message,
        orderId,
        orderInfo,
        orderType,
        partnerCode,
        payType,
        requestId,
        responseTime,
        resultCode,
        transId,
    } = params;

    const rawSignature =
        "accessKey=" +
        accessKey +
        "&amount=" +
        amount +
        "&extraData=" +
        extraData +
        "&message=" +
        message +
        "&orderId=" +
        orderId +
        "&orderInfo=" +
        orderInfo +
        "&orderType=" +
        orderType +
        "&partnerCode=" +
        partnerCode +
        "&payType=" +
        payType +
        "&requestId=" +
        requestId +
        "&responseTime=" +
        responseTime +
        "&resultCode=" +
        resultCode +
        "&transId=" +
        transId;

    const signature = crypto
        .createHmac("sha256", secretKey)
        .update(rawSignature, "utf8")
        .digest("hex");

    return { rawSignature, signature };
}

module.exports = {
    buildRawSignature,
    generateSignature,
    createMomoSignatureForCreatePayment,
    createMomoSignatureForIpn,
};
