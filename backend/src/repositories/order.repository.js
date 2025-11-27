const Order = require("../models/order.model");

module.exports = {
    create(data) {
        return Order.create(data);
    },

    findById(id) {
        return Order.findById(id).lean();
    },

  findByZaloAppTransId(apptransid) {
    return Order.findOne({ zaloAppTransId: apptransid }).lean();
  },

  // Tìm đơn ZaloPay chưa paid theo số tiền (lấy đơn mới nhất trong vòng 24h)
  async findRecentUnpaidZaloByAmount(amount, hours = 24) {
    const since = new Date(Date.now() - hours * 3600 * 1000);
    return Order.findOne({
      paymentMethod: "zalopay",
      paymentStatus: { $ne: "paid" },
      totalAmount: amount,
      createdAt: { $gte: since },
    })
      .sort({ createdAt: -1 })
      .lean();
  },

  findByUser(userId) {
    return Order.find({ userId }).sort({ createdAt: -1 }).lean();
  },

    findAll(filter = {}, options = {}) {
        const { page = 1, limit = 20 } = options;
        return Order.find(filter)
            .populate('userId', 'fullName email username phone')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();
    },

    updateStatus(orderId, status) {
        return Order.findByIdAndUpdate(orderId, { status }, { new: true });
    },

    // 🔹 update generic theo id
    updateById(orderId, update) {
        return Order.findByIdAndUpdate(orderId, update, { new: true });
    },

  // 🔹 update riêng paymentStatus (hoặc kèm status)
  updatePaymentStatus(orderId, paymentStatus) {
    const update =
      typeof paymentStatus === "string"
        ? { paymentStatus }
        : paymentStatus;

    return Order.findByIdAndUpdate(
      orderId,
      update,
      { new: true }
    );
  },

  // 🔹 Tìm orders theo discount code ID
  findByDiscountCode(discountCodeId) {
    return Order.find({ discountCodeId })
      .populate('userId', 'fullName email')
      .sort({ createdAt: -1 })
      .lean();
  },
};
