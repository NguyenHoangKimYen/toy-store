const express = require("express");
const router = express.Router();
const {
    createCartItem,
    getItemsByCartId,
    updateCartItem,
    deleteCartItem,
} = require("../controllers/cart-item.controller");

router.post("/", createCartItem);
router.get("/cart/:cartId", getItemsByCartId);
router.put("/:id", updateCartItem);
router.delete("/:id", deleteCartItem);

module.exports = router;
