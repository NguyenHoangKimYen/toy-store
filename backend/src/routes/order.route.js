const express = require('express');
const router = express.Router();
const orderController = require("../controllers/order.controller");
const auth = require("../middlewares/auth.middleware");
const adminOnly = require("../middlewares/admin.middleware");

// User tạo đơn
router.post('/', orderController.create);

// Admin thay đổi trạng thái đơn
router.put('/:id/status', auth, adminOnly, orderController.updateStatus);

// Admin lấy orders theo discount code
router.get("/discount/:discountCodeId", auth, adminOnly, orderController.getOrdersByDiscountCode);

// Admin xem tất cả đơn hàng
router.get("/admin/all", auth, adminOnly, orderController.adminGetAll);

// Lấy chi tiết đơn (guest - no auth required)
router.get("/:id/guest", orderController.getDetail);

// Lấy chi tiết đơn (authenticated)
router.get("/:id", auth, orderController.getDetail);

// User xem đơn của mình
router.get("/", auth, orderController.getMyOrders);

// User hủy đơn của mình
router.put("/:id/cancel", auth, orderController.cancelOrder);

// Checkout cart: User
router.post("/checkout/cart", auth, orderController.checkoutFromCartForUser); //tạo đơn

// Checkout cart: Guest
router.post("/checkout/cart/guest", orderController.checkoutFromCartForGuest); //tạo đơn

module.exports = router;
