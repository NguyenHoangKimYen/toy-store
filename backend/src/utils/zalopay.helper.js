const axios = require("axios");
const qs = require("qs");
const crypto = require("crypto");

const ZALOPAY_CONFIG = {
    appid: process.env.ZALOPAY_APP_ID,
    key1: process.env.ZALOPAY_KEY1,
    key2: process.env.ZALOPAY_KEY2,
    endpoint:
        process.env.ZALOPAY_ENDPOINT ||
        "https://sandbox.zalopay.com.vn/v001/tpe/createorder",
    callbackUrl: process.env.ZALOPAY_CALLBACK_URL,
    redirectUrl: process.env.ZALOPAY_REDIRECT_URL,
};

function hmacSHA256(data, key) {
    return crypto.createHmac("sha256", key).update(data).digest("hex");
}

// Create ZaloPay order payload and call the sandbox endpoint
async function createZaloPayOrder(order) {
    const appid = ZALOPAY_CONFIG.appid;
    const key1 = ZALOPAY_CONFIG.key1;

    if (!appid || !key1) {
        throw new Error("Missing ZaloPay configuration");
    }

    const now = new Date();
    const yyMMdd = now.toISOString().slice(2, 10).replace(/-/g, "");
    const random = Math.floor(100000 + Math.random() * 900000);
    const apptransid = `${yyMMdd}_${random}`;

    const amount = parseInt(order.totalAmount.toString(), 10);
    const apptime = Date.now();
    const appuser = order.userId?.toString() || "guest";

    const embeddata = JSON.stringify({
        redirecturl: ZALOPAY_CONFIG.redirectUrl,
    });

    const item = JSON.stringify([]);

    const data = `${appid}|${apptransid}|${appuser}|${amount}|${apptime}|${embeddata}|${item}`;
    const mac = hmacSHA256(data, key1);

    const payload = qs.stringify({
        appid,
        appuser,
        apptime,
        amount,
        apptransid,
        embeddata,
        item,
        description: `MilkyBloom - Order #${order._id}`,
        bankcode: "zalopayapp",
        callbackurl: ZALOPAY_CONFIG.callbackUrl,
        mac,
    });

    const headers = {
        "Content-Type": "application/x-www-form-urlencoded",
    };

    const response = await axios.post(ZALOPAY_CONFIG.endpoint, payload, {
        headers,
    });

    return response.data;
}

module.exports = {
    hmacSHA256,
    createZaloPayOrder,
};
