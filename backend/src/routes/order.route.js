const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");

router.post("/", orderController.createOrder);
router.get("/user/:userId", orderController.getUserOrders);
router.get("/:id", orderController.getOrderById);
router.put("/:id/status", orderController.updateStatus);
router.get("/", orderController.getAllOrders);

module.exports = router;
