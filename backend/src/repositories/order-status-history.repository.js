const OrderStatusHistory = require('../models/order-status-history.model');

module.exports = {
    add(orderId, status) {
        return OrderStatusHistory.create({ orderId, status });
    },

    getHistory(orderId) {
        return OrderStatusHistory.find({ orderId })
            .sort({ updatedAt: -1 })
            .lean();
    }
};
