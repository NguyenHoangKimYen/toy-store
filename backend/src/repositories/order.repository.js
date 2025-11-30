const Order = require("../models/order.model");
const User = require("../models/user.model");

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
        const { page = 1, limit = 20, search, status, deliveryType, paymentMethod, sortBy } = options;
        
        // Build MongoDB query
        const query = { ...filter };
        
        // Add search filter if provided
        if (search && search.trim()) {
            const searchTerm = search.trim();
            
            // Escape special regex characters to prevent errors
            const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            
            // Build OR conditions for searchable fields
            const orConditions = [];
            
            // Search for matching users by email, fullName, or username
            try {
                const searchRegex = new RegExp(escapedSearchTerm, 'i');
                const matchingUsers = await User.find({
                    $or: [
                        { email: { $regex: searchRegex } },
                        { fullName: { $regex: searchRegex } },
                        { username: { $regex: searchRegex } }
                    ]
                }).select('_id').lean();
                
                // Add user IDs to search conditions
                if (matchingUsers.length > 0) {
                    const userIds = matchingUsers.map(u => u._id);
                    orConditions.push({ userId: { $in: userIds } });
                }
            } catch (err) {
                console.error('Error searching users:', err);
            }
            
            // Search by order ID - if it's a valid ObjectId, search directly
            if (/^[0-9a-fA-F]{24}$/.test(searchTerm)) {
                orConditions.push({ _id: searchTerm });
            }
            
            // Only add $or if we have conditions, otherwise return empty result
            if (orConditions.length > 0) {
                query.$or = orConditions;
            } else {
                // No matching users or valid order ID pattern found
                // Return empty result by adding impossible condition
                query._id = null;
            }
        }
        
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
        
        // Build sort object based on sortBy parameter
        let sortOptions = { createdAt: -1 }; // Default: newest first
        if (sortBy) {
            switch (sortBy) {
                case 'newest':
                    sortOptions = { createdAt: -1 };
                    break;
                case 'oldest':
                    sortOptions = { createdAt: 1 };
                    break;
                case 'total-high':
                    sortOptions = { totalAmount: -1 };
                    break;
                case 'total-low':
                    sortOptions = { totalAmount: 1 };
                    break;
                default:
                    sortOptions = { createdAt: -1 };
            }
        }
        
        return Order.find(query)
            .populate('userId', 'fullName email username phone')
            .populate('addressId', 'fullNameOfReceiver phone addressLine city postalCode lat lng')
            .populate('discountCodeId', 'code value')
            .populate('voucherId', 'code value type')
            .sort(sortOptions)
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
