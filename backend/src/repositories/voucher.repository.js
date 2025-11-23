const Voucher = require("../models/voucher.model");

module.exports = {
    findById(id) {
        return Voucher.findById(id);
    },
    findActive() {
        return Voucher.find({ isActive: true });
    },
};
