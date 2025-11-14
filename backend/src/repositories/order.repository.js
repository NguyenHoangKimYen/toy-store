const Order = require('../models/order.model');

module.exports = {
  create(data) {
    return Order.create(data);
  },

  findById(id) {
    return Order.findById(id).lean();
  },

  findByUser(userId) {
    return Order.find({ userId }).sort({ createdAt: -1 }).lean();
  },

  findAll(filter = {}, options = {}) {
    const { page = 1, limit = 20 } = options;
    return Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
  },

  updateStatus(orderId, status) {
    return Order.findByIdAndUpdate(orderId, { status }, { new: true });
  }
};
