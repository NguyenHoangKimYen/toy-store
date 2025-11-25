const express = require("express");
const router = express.Router();
const loyaltyController = require("../controllers/loyalty.controller");
const auth = require("../middlewares/auth.middleware");

// Lấy thông tin loyalty của mình
router.get("/me", auth, loyaltyController.getMyLoyalty);

// Lấy danh sách coin
router.get("/points", auth, loyaltyController.getMyCoinTransactions);

// Lấy toàn bộ history coin
router.get("/history", auth, loyaltyController.getHistory);

// Đổi coin → voucher (nếu có tính năng reward shop)
router.post("/redeem", auth, loyaltyController.redeemCoins);

module.exports = router;
