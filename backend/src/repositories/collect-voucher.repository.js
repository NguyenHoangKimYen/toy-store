const CollectVoucher = require('../models/collect-voucher.model');

module.exports = {
    create(data) {
        return CollectVoucher.create(data);
    },

    findByUser(userId) {
        return CollectVoucher.find({ userId }).populate('voucherId');
    },

    findByUserAndVoucher(userId, voucherId) {
        return CollectVoucher.findOne({ userId, voucherId });
    },

    markUsed(id) {
        return CollectVoucher.findByIdAndUpdate(id, { used: true });
    },
};
