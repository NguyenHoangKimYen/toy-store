const mongoose = require('mongoose');

const CollectVoucherSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    voucherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DiscountCode",
        required: true,
    },
    collectedAt: { type: Date, default: Date.now },
    used: { type: Boolean, default: false },
});

module.exports = mongoose.model('CollectVoucher', CollectVoucherSchema);
