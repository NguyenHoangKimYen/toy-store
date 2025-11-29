const OrderItem = require("../models/order-item.model");

module.exports = {
    createMany(items) {
        return OrderItem.insertMany(items);
    },

    findByOrder(orderId) {
        return OrderItem.find({ orderId })
            .populate('productId', 'name imageUrls description slug')
            .populate('variantId', 'attributes imageUrls price stockQuantity')
            .lean();
    },
};
