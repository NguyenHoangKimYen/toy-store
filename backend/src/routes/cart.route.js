const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cart.controller");

router.get("/", cartController.getAllCarts);
router.get("/user/:userId", cartController.getCartByUser);
router.get("/session/:sessionId", cartController.getCartBySession);
router.post("/", cartController.createCart);
// router.post("/:cartId/add-item", cartController.addItem);
// router.post("/:cartId/remove-item", cartController.removeItem);
router.delete("/:cartId/clear", cartController.clearCart);
router.delete("/:cartId", cartController.deleteCart);

module.exports = router;
