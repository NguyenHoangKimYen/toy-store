const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
    // Khóa ngoại: Đơn hàng chứa mục này (FK → Order)
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
    },

    // Khóa ngoại: Sản phẩm được đặt hàng (FK → Product)
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },

    variantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Variant",
        required: true,
    },

    // Số lượng sản phẩm được đặt
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },

    // Giá của sản phẩm tại thời điểm đặt hàng
    unitPrice: {
        type: mongoose.Schema.Types.Decimal128,
        required: true,
        min: 0,
    },

    // Tổng tiền cho mục này
    subtotal: {
        type: mongoose.Schema.Types.Decimal128,
        required: true,
        min: 0,
    },
});

// Index để truy vấn nhanh các sản phẩm trong đơn hàng
OrderItemSchema.index({ orderId: 1, productId: 1 });

module.exports = mongoose.model('OrderItem', OrderItemSchema);
