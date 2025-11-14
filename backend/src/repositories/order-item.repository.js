const OrderItem = require('../models/order-item.model');

module.exports = {
    createMany(items) {
        return OrderItem.insertMany(items);
    },

    findByOrder(orderId) {
        return OrderItem.find({ orderId }).lean();
    }
};
