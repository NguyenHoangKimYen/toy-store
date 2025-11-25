const CollectVoucherRepo = require("../repositories/collect-voucher.repository");
const DiscountRepo = require("../repositories/discount-code.repository");
const voucherRepository = require("../repositories/voucher.repository");
const userVoucherRepository = require("../repositories/user-voucher.repository");

module.exports = {
    async collectVoucher(userId, voucherId) {
        // 1) Try collect from Voucher model (isCollectable)
        const voucher = await voucherRepository.findById(voucherId);
        if (voucher) {
            const now = new Date();
            const startAt = voucher.startDate || voucher.createdAt || now;
            const endAt = voucher.endDate || voucher.expiredAt;

            if (!voucher.isCollectable) {
                throw new Error("Voucher không hỗ trợ thu thập");
            }
            if (startAt && startAt > now) {
                throw new Error("Voucher chưa bắt đầu");
            }
            if (endAt && endAt < now) {
                throw new Error("Voucher đã hết hạn");
            }

            const exist = await userVoucherRepository.findByUserAndVoucher(
                userId,
                voucherId,
            );
            if (exist) throw new Error("Đã thu thập voucher này");

            return userVoucherRepository.create({
                userId,
                voucherId,
                usedAt: null,
            });
        }

        // 2) Fallback: collect DiscountCode
        const discount = await DiscountRepo.findById(voucherId);
        if (!discount) throw new Error("Voucher not found");

        // Check expiration
        if (new Date(discount.endDate) < new Date()) {
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
