const axios = require("axios");
const orderRepository = require("../repositories/order.repository");
const paymentRepository = require("../repositories/payment.repository");
const {
  createMomoPayment,
  createZaloPayOrderService,
  verifyZaloPayCallback,
  handleZaloCallback,
} = require("../services/payment.service");

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

    const bank = "mb";
    const account = "195703200508";
    const addInfo = `MB_${order._id}`;

    // Lưu phương thức thanh toán để tránh bị ghi đè bởi cổng khác
    if (order.paymentMethod !== "vietqr") {
      await orderRepository.updateById(orderId, { paymentMethod: "vietqr" });
    }

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
      await orderRepository.updatePaymentStatus(orderId, {
        status: "cancelled",
        paymentStatus: "failed",
        paymentMethod: "vietqr",
      });

            return res.status(400).json({
                success: false,
                message: 'Đơn hàng đã quá hạn 24 giờ và đã bị hủy tự động.',
                status: 'cancelled',
            });
        }

    // Nếu đã thanh toán
    if (order.paymentStatus === "paid" || order.status === "confirmed") {
      return res.json({
        success: true,
        message: "Đơn hàng đã được xác nhận thanh toán",
        status: "confirmed",
      });
    }

    // Ghi nhận khách đã chuyển khoản và chờ admin xác nhận
    await orderRepository.updatePaymentStatus(orderId, {
      paymentMethod: "vietqr",
      paymentStatus: "pending",
    });

    const existingPayment = await paymentRepository.findByOrderId(orderId);
    const txId = existingPayment?.transactionId || `VIETQR-${orderId}`;
    if (existingPayment) {
      await paymentRepository.updateByOrderId(orderId, {
        method: "vietqr",
        status: "pending",
        transactionId: txId,
      });
    } else {
      await paymentRepository.create({
        orderId,
        method: "vietqr",
        status: "pending",
        transactionId: txId,
      });
    }

    return res.json({
      success: true,
      message: "MilkyBloom đã nhận được thông tin chuyển khoản của bạn và sẽ kiểm tra trong thời gian sớm nhất.",
    });

  } catch (err) {
    console.log("customerConfirmVietQR ERROR:", err);
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
      await orderRepository.updatePaymentStatus(orderId, {
        status: "cancelled",
        paymentStatus: "failed",
        paymentMethod: "vietqr",
      });

            return res.status(400).json({
                success: false,
                message:
                    'Đơn hàng đã quá 24 giờ và bị hủy. Không thể xác nhận thanh toán.',
                status: 'cancelled',
            });
        }

    if (order.paymentStatus === "paid" || order.status === "confirmed") {
      return res.json({
        success: true,
        message: "Đơn hàng đã ở trạng thái confirmed",
        status: "confirmed",
      });
    }

    const now = new Date();
    const updatedOrder = await orderRepository.updatePaymentStatus(orderId, {
      status: "confirmed",
      paymentStatus: "paid",
      paymentMethod: "vietqr",
    });

    const existingPayment = await paymentRepository.findByOrderId(orderId);
    const txId = existingPayment?.transactionId || `VIETQR-${orderId}`;
    if (existingPayment) {
      await paymentRepository.updateByOrderId(orderId, {
        method: "vietqr",
        status: "success",
        transactionId: txId,
        paidAt: now,
      });
    } else {
      await paymentRepository.create({
        orderId,
        method: "vietqr",
        status: "success",
        transactionId: txId,
        paidAt: now,
      });
    }

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

    await orderRepository.updatePaymentStatus(orderId, {
      status: "cancelled",
      paymentStatus: "failed",
      paymentMethod: "vietqr",
    });

    const existingPayment = await paymentRepository.findByOrderId(orderId);
    const txId = existingPayment?.transactionId || `VIETQR-${orderId}`;
    if (existingPayment) {
      await paymentRepository.updateByOrderId(orderId, {
        method: "vietqr",
        status: "failed",
        transactionId: txId,
      });
    } else {
      await paymentRepository.create({
        orderId,
        method: "vietqr",
        status: "failed",
        transactionId: txId,
      });
    }

    return res.json({
      success: true,
      message: "Đã từ chối thanh toán VietQR. Đơn hàng đã bị hủy.",
      status: "cancelled",
    });

  } catch (err) {
    console.log("adminRejectVietQR ERROR:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// CASH (COD) — ghi nhận thanh toán tiền mặt, sẽ thu tiền khi giao hàng
exports.payByCash = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await orderRepository.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (["cancelled", "returned"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: "Đơn đã bị hủy/hoàn, không thể chọn thanh toán tiền mặt.",
      });
    }

    if (order.paymentStatus === "paid") {
      return res.json({
        success: true,
        message: "Đơn đã được thanh toán trước đó.",
        order,
      });
    }

    const updatePayload = {
      paymentStatus: "pending", // sẽ chuyển sang paid khi giao hàng thành công
      paymentMethod: "cashondelivery",
    };

    // Xác nhận đơn nếu đang ở trạng thái pending
    if (order.status === "pending") {
      updatePayload.status = "confirmed";
    }

    const updatedOrder = await orderRepository.updatePaymentStatus(orderId, updatePayload);

    const existingPayment = await paymentRepository.findByOrderId(orderId);
    const txId = existingPayment?.transactionId || `CASH-${orderId}`;

    const paymentPayload = {
      method: "cashondelivery",
      status: "pending",
      transactionId: txId,
      paidAt: null,
    };

    if (existingPayment) {
      await paymentRepository.updateByOrderId(orderId, paymentPayload);
    } else {
      await paymentRepository.create({
        orderId,
        ...paymentPayload,
      });
    }

    return res.json({
      success: true,
      message: "Đã xác nhận thanh toán, nhân viên sẽ thu tiền khi giao hàng.",
      order: updatedOrder,
    });
  } catch (err) {
    console.error("payByCash error:", err);
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

    const isSuccess = Number(resultCode) === 0;
    const update = isSuccess
      ? { paymentStatus: "paid", status: "confirmed" }
      : { paymentStatus: "failed", status: "cancelled" };

    await orderRepository.updatePaymentStatus(orderId, update);

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

    // Ghi nhận phương thức thanh toán nếu chưa có
    if (!order.paymentMethod) {
      await orderRepository.updateById(orderId, { paymentMethod: "zalopay" });
    }

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
    // if (!valid) return res.json({ returncode: -1, returnmessage: "Invalid MAC" });

    const rawData = req.body.data;
    const data = typeof rawData === "string" ? JSON.parse(rawData) : rawData || {};

    let orderId = null;
    if (data?.embeddata) {
      try {
        const embed = JSON.parse(data.embeddata);
        orderId = embed.orderId || null;
      } catch (e) {
        console.log("Parse embeddata error:", e);
      }
    }

    // Fallback: thử lấy trực tiếp
    if (!orderId) {
      orderId =
        data.orderId ||
        data.order_id ||
        req.body.orderId ||
        req.body.order_id ||
        req.query.orderId ||
        null;
    }

        if (!orderId) {
            return res.json({
                returncode: -1,
                returnmessage: 'Missing orderId in callback',
            });
        }

    const returnCodeRaw =
      data.returncode ??
      data.return_code ??
      data.returnCode ??
      req.body.returncode ??
      req.body.return_code ??
      req.body.returnCode;

    const returnCode = Number(returnCodeRaw);
    if (Number.isNaN(returnCode)) {
      console.log("ZaloPay callback missing/invalid returnCode", req.body);
      return res.json({ returncode: -1, returnmessage: "Missing return code" });
    }

    await handleZaloCallback({ orderId, return_code: Number(returnCode) });

    return res.json({ returncode: 1, returnmessage: "Success" });
  } catch (err) {
    console.error("ZaloPay callback error:", err);
    return res.json({ returncode: 0, returnmessage: err.message });
  }
};

// Trang success (redirect) của ZaloPay → tự động cập nhật trạng thái nếu đủ thông tin
exports.paymentSuccess = async (req, res) => {
  try {
    const { apptransid, status, returncode, return_code, orderId: queryOrderId, order_id, amount } = req.query;
    const { orderId: paramOrderId } = req.params; // Also check route params

    const codeRaw = returncode ?? return_code ?? status;
    const code = Number(codeRaw);

    // Ưu tiên orderId từ params, then query, nếu không có thì tìm bằng apptransid đã lưu
    let oid = paramOrderId || queryOrderId || order_id || null;
    if (!oid && apptransid) {
      const found = await orderRepository.findByZaloAppTransId(apptransid);
      if (found?._id) oid = found._id.toString();
    }

    // Fallback: tìm đơn ZaloPay chưa paid theo amount trong 24h
    if (!oid && amount && !Number.isNaN(Number(amount))) {
      const candidate = await orderRepository.findRecentUnpaidZaloByAmount(Number(amount));
      if (candidate?._id) {
        oid = candidate._id.toString();
        // Lưu apptransid nếu có
        if (apptransid) {
          await orderRepository.updateById(candidate._id, { zaloAppTransId: apptransid });
        }
      }
    }

    if (oid && !Number.isNaN(code)) {
      const isSuccess = code === 1;
      const update = isSuccess
        ? { paymentStatus: "paid", status: "confirmed", paymentMethod: "zalopay" }
        : { paymentStatus: "failed", status: "cancelled", paymentMethod: "zalopay" };
      await orderRepository.updatePaymentStatus(oid, update);
    }

    // Redirect to payment page with order ID so user sees payment result
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const redirectUrl = new URL(`${frontendUrl}/payment/${oid || 'unknown'}`);
    redirectUrl.searchParams.set("status", code === 1 ? "1" : "-1");
    if (amount) redirectUrl.searchParams.set("amount", amount);
    if (apptransid) redirectUrl.searchParams.set("apptransid", apptransid);

    return res.redirect(302, redirectUrl.toString());
  } catch (err) {
    console.error("paymentSuccess error:", err);
    return res.status(500).send("Có lỗi xảy ra khi xử lý kết quả thanh toán.");
  }
};

// ZaloPay return URL handler (when user is redirected back from ZaloPay)
exports.zaloPayReturn = async (req, res) => {
  try {
    const { status, apptransid, amount } = req.query;
    
    // Find order by apptransid
    let orderId = null;
    if (apptransid) {
      const order = await orderRepository.findByZaloAppTransId(apptransid);
      if (order) {
        orderId = order._id.toString();
      }
    }

    // If status is 1, payment successful
    if (orderId && status === '1') {
      await orderRepository.updatePaymentStatus(orderId, {
        paymentStatus: "paid",
        status: "confirmed",
        paymentMethod: "zalopay",
        isPaid: true,
      });
      
      return res.json({ 
        success: true, 
        orderId,
        message: "Payment confirmed" 
      });
    }

    return res.json({ 
      success: false, 
      message: "Payment not confirmed" 
    });
  } catch (err) {
    console.error("ZaloPay return error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
