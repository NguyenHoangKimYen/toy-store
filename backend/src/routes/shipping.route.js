const express = require('express');
const router = express.Router();
const { calculateShipping } = require('../controllers/shipping.controller.js');
const auth = require('../middlewares/auth.middleware.js');

// Tính phí giao hàng theo địa chỉ
router.post('/calculate/:addressId', auth, calculateShipping);

module.exports = router;
