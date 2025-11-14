const crypto = require("crypto");
const qs = require("qs");

// Sort object A–Z
function sortObject(obj) {
    const sorted = {};
    const keys = Object.keys(obj).sort();
    for (let key of keys) sorted[key] = obj[key];
    return sorted;
}

// Create payment URL
function createVnpayUrl(orderId, amount, ipAddr, config) {
    const date = new Date();
    const pad = (n) => (n < 10 ? "0" + n : n);

    const YYYY = date.getFullYear();
    const MM = pad(date.getMonth() + 1);
    const DD = pad(date.getDate());
    const HH = pad(date.getHours());
    const mm = pad(date.getMinutes());
    const ss = pad(date.getSeconds());

    const createDate = `${YYYY}${MM}${DD}${HH}${mm}${ss}`;

    const finalAmount = Number(amount) * 100;

    const params = {
        vnp_Version: "2.1.0",
        vnp_Command: "pay",
        vnp_TmnCode: config.vnp_TmnCode,
        vnp_Amount: finalAmount,
        vnp_CurrCode: "VND",
        vnp_TxnRef: orderId,
        vnp_OrderInfo: `Thanh toan don hang ${orderId}`,
        vnp_OrderType: "billpayment",
        vnp_Locale: "vn",
        vnp_IpAddr: ipAddr,
        vnp_CreateDate: createDate,
        vnp_ReturnUrl: config.vnp_ReturnUrl,
    };

    // 🟢 MUST INCLUDE IPN URL IF YOU USE IT
    if (config.vnp_IpnUrl) {
        params['vnp_IpnUrl'] = config.vnp_IpnUrl;
    }

    // Sort parameters
    const sortedParams = sortObject(params);

    // Create sign data string
    const signData = qs.stringify(sortedParams, { encode: false });

    // Create secure hash
    const hmac = crypto.createHmac("sha512", config.vnp_HashSecret);
    const secureHash = hmac.update(signData).digest("hex");

    sortedParams["vnp_SecureHash"] = secureHash;

    const paymentUrl =
        config.vnp_Url + "?" + qs.stringify(sortedParams, { encode: false });

    return paymentUrl;
}

// Verify checksum
function verifyVnpayChecksum(params, secretKey) {
    const secureHash = params.vnp_SecureHash;
    delete params.vnp_SecureHash;
    delete params.vnp_SecureHashType;

    const sorted = sortObject(params);
    const signData = qs.stringify(sorted, { encode: false });

    const hmac = crypto.createHmac("sha512", secretKey);
    const checkHash = hmac.update(signData).digest("hex");

    return secureHash === checkHash;
}

module.exports = { createVnpayUrl, verifyVnpayChecksum };
