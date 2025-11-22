const express = require("express");
const router = express.Router();
const loyaltyController = require("../controllers/loyalty.controller");
const auth = require("../middlewares/auth.middleware");

// lấy coin
router.get("/points", auth, loyaltyController.getMyCoinTransactions);

// lấy toàn bộ history coin
router.get("/history", auth, loyaltyController.getHistory);

// đổi coin → voucher (nếu có tính năng reward shop)
router.post("/redeem", auth, loyaltyController.redeemCoins);

module.exports = router;
