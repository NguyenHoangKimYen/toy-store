const mongoose = require("mongoose");

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
// [THÊM] LOGIC TỰ ĐỘNG CẬP NHẬT TỔNG GIỎ HÀNG CHA
// ================================================================

// Hàm helper để tính toán lại tổng tiền của Cart
async function recalculateCart(cartId) {
    if (!cartId) return;

    // Lấy tất cả CartItem của giỏ hàng này
    const items = await mongoose.model("CartItem").find({ cartId: cartId });

    let newTotalPrice = 0;
    const itemIds = []; // [MỚI] Mảng để chứa ID của các item

    if (items.length > 0) {
        // Tính tổng và thu thập ID
        newTotalPrice = items.reduce((sum, item) => {
            itemIds.push(item._id); // [MỚI] Thêm ID vào mảng
            return sum + parseFloat(item.price.toString());
        }, 0);
    }

    // Cập nhật giỏ hàng cha
    mongoose.model("Cart").findByIdAndUpdate(cartId, { 
        totalPrice: newTotalPrice,
        items: itemIds // [MỚI] Cập nhật mảng items
    });
    
    console.log(`Updated Cart ${cartId}: ${newTotalPrice} VND & ${itemIds.length} items.`);
}

// Kích hoạt sau khi một item được 'save' (tạo mới hoặc cập nhật)
CartItemSchema.post('save', async function() {
    await recalculateCart(this.cartId);
});

// Kích hoạt sau khi một item bị 'remove'
CartItemSchema.post('findOneAndDelete', async function(doc) {
    if (doc) {
        await recalculateCart(doc.cartId);
    }
});
// ================================================================

module.exports = mongoose.model("CartItem", CartItemSchema);