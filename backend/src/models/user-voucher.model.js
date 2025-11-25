const mongoose = require("mongoose");
//Lưu trữ các voucher mà người dùng đã nhận và sử dụng
const userVoucherSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        voucherId: { type: mongoose.Schema.Types.ObjectId, ref: "Voucher" },
        usedAt: Date,
    },
    { timestamps: true },
);

module.exports = mongoose.model("UserVoucher", userVoucherSchema);
