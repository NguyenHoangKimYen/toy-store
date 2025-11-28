const express = require('express');
const router = express.Router();
const {
    getShippingFee, // dành cho KH chưa đăng nhập
    calculateShippingFeeByUser, // dành cho KH đã đăng nhập
} = require('../controllers/shipping.controller');

// FE gửi thông tin địa chỉ tạm → BE tính phí tạm thời
router.post('/fee', getShippingFee);

// BE tự tìm defaultAddress trong DB
router.get('/fee/:userId', calculateShippingFeeByUser);

module.exports = router;
