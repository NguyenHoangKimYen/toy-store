const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cart.controller");
const adminOnly = require("../middlewares/admin.middleware");

//admin route
router.get("/", adminOnly, cartController.getAllCarts);
router.get("/user/:userId", adminOnly, cartController.getCartByUser);
router.get("/session/:sessionId", adminOnly, cartController.getCartBySession);

//user route
router.post("/", cartController.createCart);
router.post("/:cartId/add-item", cartController.addItem);
router.post("/:cartId/remove-item", cartController.removeItem);
router.delete("/:cartId/clear", cartController.clearCart);
router.delete("/:cartId", cartController.deleteCart);

module.exports = router;
