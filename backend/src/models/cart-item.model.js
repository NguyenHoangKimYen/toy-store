const mongoose = require("mongoose");

const CartItemSchema = new mongoose.Schema({
    cartId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Cart",
        required: true,
    },

    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },

    quantity: {
        type: Number,
        required: true,
        min: 1,
    },

    price: {
        type: mongoose.Schema.Types.Decimal128,
        required: true,
        min: 0,
    },
});

CartItemSchema.index({ cartId: 1, productId: 1 }, { unique: true });

module.exports = mongoose.model("CartItem", CartItemSchema);
