const UserVoucher = require("../models/user-voucher.model");

module.exports = {
    create(data) {
        return UserVoucher.create(data);
    },

    countUserUsage(userId, voucherId) {
        return UserVoucher.countDocuments({ userId, voucherId });
    },

    getUserVouchers(userId) {
        return UserVoucher.find({ userId }).populate("voucherId");
    }
};
