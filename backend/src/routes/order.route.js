const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");
const auth = require("../middlewares/auth.middleware");
const adminOnly = require("../middlewares/auth.middleware");

// User tạo đơn
router.post("/", orderController.create);

// Admin thay đổi trạng thái đơn
router.put("/:id/status", auth, adminOnly, orderController.updateStatus);

// Lấy chi tiết đơn
router.get("/:id", auth, orderController.getDetail);

// User xem đơn của mình
router.get("/", auth, orderController.getMyOrders);

// Checkout cart: User
router.post("/checkout/cart", auth, orderController.checkoutFromCartForUser);

// Checkout cart: Guest
router.post("/checkout/cart/guest", orderController.checkoutFromCartForGuest);

module.exports = router;
