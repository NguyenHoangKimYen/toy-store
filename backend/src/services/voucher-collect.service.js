const CollectVoucherRepo = require("../repositories/collect-voucher.repository");
const DiscountRepo = require("../repositories/discount-code.repository");

module.exports = {
    async collectVoucher(userId, voucherId) {
        const voucher = await DiscountRepo.findById(voucherId);
        if (!voucher) throw new Error("Voucher not found");

        // Check expiration
        if (new Date(voucher.endDate) < new Date()) {
            throw new Error("Voucher expired");
        }

        // Check limit
        const exist = await CollectVoucherRepo.findByUserAndVoucher(
            userId,
            voucherId,
        );
        if (exist) throw new Error("Already collected");

        return await CollectVoucherRepo.create({
            userId,
            voucherId,
            collectedAt: new Date(),
            used: false,
        });
    },

    async getUserVouchers(userId) {
        return CollectVoucherRepo.findByUser(userId);
    },
};
