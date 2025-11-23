const Payment = require("../models/payment.model");

module.exports = {
    create(data) {
        return Payment.create(data);
    },

    findByOrderId(orderId) {
        return Payment.findOne({ orderId }).lean();
    },

    updateByOrderId(orderId, payload) {
        return Payment.findOneAndUpdate({ orderId }, payload, { new: true });
    },
};
