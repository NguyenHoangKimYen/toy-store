const mongoose = require('mongoose');
// [XÓA] Dòng dưới đây gây ra lỗi Circular Dependency
// const CartRepository = require("../repositories/cart.repository");

const CartItemSchema = new mongoose.Schema(
    {
        cartId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Cart',
            required: true,
        },

        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },

        variantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Variant',
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
    },
    {
        toJSON: {
            transform: function (doc, ret) {
                ret.id = ret._id.toString();
                delete ret._id;
                delete ret.__v;

                // Convert Decimal128 to number for price
                if (ret.price) {
                    ret.price = parseFloat(ret.price.toString());
                }

                // Rename populated fields for frontend
                if (ret.productId) {
                    ret.product = ret.productId;
                    delete ret.productId;
                }
                if (ret.variantId) {
                    ret.variant = ret.variantId;
                    delete ret.variantId;
                }

                return ret;
            },
        },
    },
);

CartItemSchema.index({ cartId: 1, variantId: 1 }, { unique: true });

// ================================================================
// [LOGIC TỰ ĐỘNG CẬP NHẬT TỔNG GIỎ HÀNG CHA]
// ================================================================

async function recalculateCart(cartId) {
    if (!cartId) return;

    const items = await mongoose.model('CartItem').find({ cartId: cartId });

    let newTotalPrice = 0;
    const itemIds = [];

    if (items.length > 0) {
        newTotalPrice = items.reduce((sum, item) => {
            itemIds.push(item._id);

            const unitPrice = parseFloat(item.price.toString());
            return sum + unitPrice * item.quantity; // ⭐⭐ SỬA TẠI ĐÂY
        }, 0);
    }

    await mongoose.model('Cart').findByIdAndUpdate(cartId, {
        totalPrice: newTotalPrice,
        items: itemIds,
    });

    console.log(
        `Updated Cart ${cartId}: ${newTotalPrice} VND & ${itemIds.length} items.`,
    );
}

CartItemSchema.post("save", async function () {
    await recalculateCart(this.cartId);
});

CartItemSchema.post("findOneAndDelete", async function (doc) {
    if (doc) {
        await recalculateCart(doc.cartId);
    }
});

module.exports = mongoose.model('CartItem', CartItemSchema);
