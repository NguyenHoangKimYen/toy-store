const Voucher = require('../models/voucher.model');

module.exports = {
    create(data) {
        return Voucher.create(data);
    },

    findById(id) {
        return Voucher.findById(id);
    },

    findAll(filter = {}) {
        return Voucher.find(filter).sort({ createdAt: -1 });
    },

    update(id, data) {
        return Voucher.findByIdAndUpdate(id, data, { new: true });
    },

    delete(id) {
        return Voucher.findByIdAndDelete(id);
    },

    findActive() {
        return Voucher.find({ isActive: true });
    },
};
