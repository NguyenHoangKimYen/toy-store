const express = require("express");
const router = express.Router();

const voucherCollectController = require("../controllers/voucher-collect.controller");
const auth = require("../middlewares/auth.middleware");

// User lấy voucher từ event
router.post(
    "/collect/:voucherId",
    auth,
    voucherCollectController.collectVoucher,
);

// Lấy danh sách voucher đã collect (chưa dùng)
router.get("/my", auth, voucherCollectController.getMyVouchers);

// Check xem voucher có thể áp dụng không
router.get("/check/:voucherId", auth, voucherCollectController.checkVoucher);

module.exports = router;
