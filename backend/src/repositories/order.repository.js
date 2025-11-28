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
    return Order.find({ userId })
      .populate('addressId', 'fullNameOfReceiver phone addressLine city postalCode')
      .populate('discountCodeId', 'code value')
      .populate('voucherId', 'code value type')
      .sort({ createdAt: -1 })
      .lean();
  },

    async findAll(filter = {}, options = {}) {
        const { page = 1, limit = 20, search, status, deliveryType, paymentMethod } = options;
        
        // Build MongoDB query
        const query = { ...filter };
        
        // Add status filter
        if (status && status !== 'all') {
            query.status = status;
        }
        
        // Add delivery type filter
        if (deliveryType && deliveryType !== 'all') {
            query.deliveryType = deliveryType;
        }
        
        // Add payment method filter
        if (paymentMethod && paymentMethod !== 'all') {
            query.paymentMethod = paymentMethod;
        }
        
        // If search is provided, we need to search in User collection first
        if (search && search.trim()) {
            const User = require('../models/user.model');
            const searchRegex = new RegExp(search.trim(), 'i');
            
            // Search for matching users
            const matchingUsers = await User.find({
                $or: [
                    { email: { $regex: searchRegex } },
                    { fullName: { $regex: searchRegex } },
                    { username: { $regex: searchRegex } }
                ]
            }).select('_id').lean();
            
            const userIds = matchingUsers.map(u => u._id);
            
            // Combine with order ID search
            query.$or = [
                { userId: { $in: userIds } }
            ];
            
            // Try to match order ID if search looks like an ObjectId
            if (search.trim().match(/^[0-9a-fA-F]{24}$/)) {
                query.$or.push({ _id: search.trim() });
            }
        }
        
        return Order.find(query)
            .populate('userId', 'fullName email username phone')
            .populate('addressId', 'fullNameOfReceiver phone addressLine city postalCode lat lng')
            .populate('discountCodeId', 'code value')
            .populate('voucherId', 'code value type')
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
