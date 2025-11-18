const mongoose = require("mongoose");
// [XÓA] Dòng dưới đây gây ra lỗi Circular Dependency
// const CartRepository = require("../repositories/cart.repository"); 

const CartItemSchema = new mongoose.Schema({
    cartId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Cart",
        required: true,
    },
    variantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Variant",
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

CartItemSchema.index({ cartId: 1, variantId: 1 }, { unique: true });

// ================================================================
// [LOGIC TỰ ĐỘNG CẬP NHẬT TỔNG GIỎ HÀNG CHA]
// ================================================================

async function recalculateCart(cartId) {
    if (!cartId) return;

    const items = await mongoose.model("CartItem").find({ cartId: cartId });

    let newTotalPrice = 0;
    const itemIds = [];

    if (items.length > 0) {
        newTotalPrice = items.reduce((sum, item) => {
            itemIds.push(item._id);
            return sum + parseFloat(item.price.toString());
        }, 0);
    }

    // [SỬA LỖI QUAN TRỌNG] 
    // Gọi trực tiếp model "Cart" từ mongoose thay vì qua Repository để tránh vòng lặp import
    await mongoose.model("Cart").findByIdAndUpdate(cartId, { 
        totalPrice: newTotalPrice,
        items: itemIds 
    });
    
    console.log(`Updated Cart ${cartId}: ${newTotalPrice} VND & ${itemIds.length} items.`);
}

CartItemSchema.post('save', async function() {
    await recalculateCart(this.cartId);
});

CartItemSchema.post('findOneAndDelete', async function(doc) {
    if (doc) {
        await recalculateCart(doc.cartId);
    }
});

module.exports = mongoose.model("CartItem", CartItemSchema);