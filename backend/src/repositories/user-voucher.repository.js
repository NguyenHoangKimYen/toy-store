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
    },

    findByUserAndVoucher(userId, voucherId) {
        return UserVoucher.findOne({ userId, voucherId });
    },

    findUsableByUser(userId) {
        return UserVoucher.find({
            userId,
            usedAt: null,
        }).populate("voucherId");
    },

    markUsed(userId, voucherId) {
        return UserVoucher.findOneAndUpdate(
            { userId, voucherId, usedAt: null },
            { usedAt: new Date() },
            { new: true },
        );
    },
};
