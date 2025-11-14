const router = require("express").Router();
const {
    createPayment,
    vnpayReturn,
    createVietQR,
} = require("../controllers/payment.controller.js");

router.post("/create", createPayment);
router.get("/vnpay/return", vnpayReturn);
router.get("/vietqr/:orderId", createVietQR);

module.exports = router;
