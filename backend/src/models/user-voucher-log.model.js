const mongoose = require('mongoose');
//Kiểm tra voucher theo hạng thành viên đã nhận được trong tháng
const UserVoucherLogSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        tier: {
            type: String,
            enum: ["silver", "gold", "diamond"],
            required: true,
        },
        month: { type: Number, required: true }, // 11 → tháng 11
        year: { type: Number, required: true }, // 2025
    },
    { timestamps: true },
);

module.exports = mongoose.model("UserVoucherLog", UserVoucherLogSchema);
