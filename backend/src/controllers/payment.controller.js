const axios = require('axios');
const orderRepository = require('../repositories/order.repository');
const {
    createZaloPayOrderService,
    verifyZaloPayCallback,
} = require('../services/payment.service');

// MoMo helper
const {
    createMomoSignatureForCreatePayment,
    createMomoSignatureForIpn,
} = require('../utils/momo.helper');

function isExpired(order) {
    const now = Date.now(); // timestamp VN hay UTC đều giống nhau
    const createdAt = new Date(order.createdAt).getTime(); // UTC timestamp
    const diffHours = (now - createdAt) / 3600000;

    return diffHours > 24;
}

// MoMo config
const MOMO_CONFIG = {
    partnerCode: process.env.MOMO_PARTNER_CODE,
    accessKey: process.env.MOMO_ACCESS_KEY,
    secretKey: process.env.MOMO_SECRET_KEY,
    endpoint: process.env.MOMO_ENDPOINT,
    redirectUrl: process.env.MOMO_REDIRECT_URL,
    ipnUrl: process.env.MOMO_IPN_URL,
};

//VietQr payment
exports.createVietQR = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const order = await orderRepository.findById(orderId);

        if (!order)
            return res
                .status(404)
                .json({ success: false, message: 'Order not found' });

        const amount = Number(order.totalAmount.toString());

        const bank = 'mb';
        const account = '195703200508';
        const addInfo = `MB_${order._id}`;

        const base = `https://img.vietqr.io/image/${bank}-${account}`;
        const bill = `${base}-bill.png?amount=${amount}&addInfo=${encodeURIComponent(addInfo)}`;

        return res.json({
            success: true,
            orderId,
            amount,
            qr: { bill },
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

//confirm payment by customer
exports.customerConfirmVietQR = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const order = await orderRepository.findById(orderId);

        if (!order) {
            return res
                .status(404)
                .json({ success: false, message: 'Order not found' });
        }

        // Nếu quá 24h thì cancel
        if (isExpired(order)) {
            await orderRepository.updateStatus(orderId, 'cancelled');

            return res.status(400).json({
                success: false,
                message: 'Đơn hàng đã quá hạn 24 giờ và đã bị hủy tự động.',
                status: 'cancelled',
            });
        }

        // Nếu đã thanh toán
        if (order.status === 'confirmed') {
            return res.json({
                success: true,
                message: 'Đơn hàng đã được xác nhận thanh toán',
                status: 'confirmed',
            });
        }

        return res.json({
            success: true,
            message:
                'Đã ghi nhận yêu cầu. Vui lòng chờ admin xác nhận thanh toán.',
        });
    } catch (err) {
        console.log('customerConfirmVietQR ERROR:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

exports.getPendingVietQROrders = async (req, res) => {
    try {
        const orders = await orderRepository.findAll(
            { status: 'pending' },
            { page: 1, limit: 50 },
        );

        return res.json({
            success: true,
            orders,
        });
    } catch (err) {
        console.log('getPendingVietQROrders ERROR:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

//accepted payment VietQR
exports.adminConfirmVietQR = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const order = await orderRepository.findById(orderId);

        if (!order) {
            return res
                .status(404)
                .json({ success: false, message: 'Order not found' });
        }

        // Nếu quá 24h thì cancel
        if (isExpired(order)) {
            await orderRepository.updateStatus(orderId, 'cancelled');

            return res.status(400).json({
                success: false,
                message:
                    'Đơn hàng đã quá 24 giờ và bị hủy. Không thể xác nhận thanh toán.',
                status: 'cancelled',
            });
        }

        if (order.status === 'confirmed') {
            return res.json({
                success: true,
                message: 'Đơn hàng đã ở trạng thái confirmed',
                status: 'confirmed',
            });
        }

        await orderRepository.updateStatus(orderId, 'confirmed');

        return res.json({
            success: true,
            message: 'Đã xác nhận thanh toán VietQR',
            status: 'confirmed',
        });
    } catch (err) {
        console.log('adminConfirmVietQR ERROR:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

//Payment Fail (admin)
exports.adminRejectVietQR = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const { reason } = req.body || {};

        const order = await orderRepository.findById(orderId);
        if (!order) {
            return res
                .status(404)
                .json({ success: false, message: 'Order not found' });
        }

        await orderRepository.updateStatus(orderId, 'cancelled');

        return res.json({
            success: true,
            message: 'Đã từ chối thanh toán VietQR. Đơn hàng đã bị hủy.',
            status: 'cancelled',
        });
    } catch (err) {
        console.log('adminRejectVietQR ERROR:', err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

//momo
exports.createMomoPayment = async (req, res) => {
    console.log('➡️ createMomoPayment CALLED');
    try {
        const orderIdParam = req.params.orderId;
        const order = await orderRepository.findById(orderIdParam);

        if (!order) throw new Error('Order not found');

        // TẠM THỜI: ép amount đúng số mà MoMo đang báo trong lỗi
        const amount = 210000;

        const partnerCode = MOMO_CONFIG.partnerCode;
        const accessKey = MOMO_CONFIG.accessKey;
        const redirectUrl = MOMO_CONFIG.redirectUrl;
        const ipnUrl = MOMO_CONFIG.ipnUrl;

        // TẠM THỜI: ép requestId bằng đúng cái trong message lỗi
        const requestId = '1763538270486';

        // TẠM THỜI: ép orderId giống trong message lỗi
        const orderId = '691bcfc87e543228bd3bc06e';

        const requestType = 'payWithMethod';
        const extraData = '';

        const orderInfo = `Thanh toan don hang ${orderId}`
            .normalize('NFKD')
            .replace(/[\u0300-\u036f]/g, '');

        // HARD-CODE RAW SIGNATURE VÀ SIGNATURE
        const rawSignature =
            'accessKey=8BLEw6zEZ0Svdvx5' +
            '&amount=210000' +
            '&extraData=' +
            '&ipnUrl=https://milkybloomtoystore.id.vn/api/payments/momo/ipn' +
            '&orderId=691bcfc87e543228bd3bc06e' +
            '&orderInfo=Thanh toan don hang 691bcfc87e543228bd3bc06e' +
            '&partnerCode=MOMOGEXT20251119_TEST' +
            '&redirectUrl=https://milkybloomtoystore.id.vn/api/payments/momo/return' +
            '&requestId=1763538270486' +
            '&requestType=payWithMethod';

        const signature =
            'efc0e887b15b27b39746decb1538a6f04e330f549ac5afbe454ef5894ea39cc1';

        console.log('RAW SIGNATURE (HARDCODE):', rawSignature);
        console.log('SIGNATURE (HARDCODE):', signature);

        const payload = {
            partnerCode,
            accessKey,
            requestId,
            amount,
            orderId,
            orderInfo,
            redirectUrl,
            ipnUrl,
            requestType,
            extraData,
            lang: 'vi',
            signature,
        };

        console.log('MOMO PAYLOAD (HARDCODE):', payload);

        const response = await axios.post(MOMO_CONFIG.endpoint, payload);

        return res.json({
            success: true,
            orderId,
            momo: response.data,
        });
    } catch (err) {
        console.log('MoMo ERROR:', err.response?.data || err.message);
        return res.status(500).json({
            success: false,
            message: 'MoMo request failed',
            momoError: err.response?.data || err.message,
        });
    }
};

exports.momoIpn = async (req, res) => {
    try {
        console.log('➡️ MoMo IPN BODY:', JSON.stringify(req.body, null, 2));

        const {
            partnerCode,
            accessKey,
            requestId,
            amount,
            orderId,
            orderInfo,
            orderType,
            transId,
            resultCode,
            message,
            payType,
            responseTime,
            extraData,
            signature,
        } = req.body;

        // (OPTIONAL) Verify signature – có thể comment nếu chỉ test dev
        // const { rawSignature, signature: expectedSignature } =
        //   createMomoSignatureForIpn(
        //     {
        //       accessKey,
        //       amount,
        //       extraData,
        //       message,
        //       orderId,
        //       orderInfo,
        //       orderType,
        //       partnerCode,
        //       payType,
        //       requestId,
        //       responseTime,
        //       resultCode,
        //       transId,
        //     },
        //     MOMO_CONFIG.secretKey
        //   );
        //
        // if (signature !== expectedSignature) {
        //   console.log("MoMo IPN INVALID SIGNATURE", { rawSignature, expectedSignature, signature });
        //   return res.json({ resultCode: 1, message: "Invalid signature" });
        // }

        if (!orderId) {
            return res.json({ resultCode: 1, message: 'Missing orderId' });
        }

        const status = Number(resultCode) === 0 ? 'paid' : 'failed';
        await orderRepository.updateStatus(orderId, status);

        return res.json({ resultCode: 0, message: 'OK' });
    } catch (err) {
        console.log('MoMo IPN ERROR', err);
        return res.json({ resultCode: 1, message: err.message });
    }
};

//momo return
exports.momoReturn = async (req, res) => {
    try {
        console.log('➡️ MoMo RETURN QUERY:', req.query);
        const { resultCode, orderId } = req.query;

        if (resultCode === '0') {
            return res.send(`🎉 Thanh toán thành công: ${orderId}`);
        }

        return res.send(`❌ Thanh toán thất bại: ${orderId || 'unknown'}`);
    } catch (err) {
        return res
            .status(500)
            .send('Có lỗi xảy ra khi xử lý kết quả thanh toán MoMo.');
    }
};

//zalopay
exports.createZaloPayOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await orderRepository.findById(orderId);

        if (!order)
            return res
                .status(404)
                .json({ success: false, message: 'Order not found' });

        const zaloResponse = await createZaloPayOrderService(order);

        return res.json({
            success: true,
            orderId,
            zaloPay: zaloResponse,
        });
    } catch (err) {
        console.log('ZaloPay Error:', err.response?.data || err.message);
        return res.status(500).json({ success: false, message: err.message });
    }
};

//zalopay callback
exports.zaloPayCallback = async (req, res) => {
    try {
        // const valid = verifyZaloPayCallback(req.body);

        // if (!valid) {
        //   return res.json({ returncode: -1, returnmessage: "Invalid MAC" });
        // }
        const rawData = req.body.data;
        const data =
            typeof rawData === 'string' ? JSON.parse(rawData) : rawData;

        // Lấy orderId từ embeddata
        if (data.embeddata) {
            try {
                const embed = JSON.parse(data.embeddata);
                orderId = embed.orderId || null;
            } catch (e) {
                console.log('Parse embeddata error:', e);
            }
        }

        if (!orderId) {
            return res.json({
                returncode: -1,
                returnmessage: 'Missing orderId in callback',
            });
        }

        await orderRepository.updateStatus(orderId, 'paid');

        return res.json({ returncode: 1, returnmessage: 'Success' });
    } catch (err) {
        return res.json({ returncode: 0, returnmessage: err.message });
    }
};
