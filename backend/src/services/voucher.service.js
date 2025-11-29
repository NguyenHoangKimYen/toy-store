const Voucher = require('../models/voucher.model');
const UserVoucher = require('../models/user-voucher.model');
const userVoucherRepository = require('../repositories/user-voucher.repository');
const voucherRepository = require('../repositories/voucher.repository');

module.exports = {
    /**
     * Admin tạo voucher
     */
    async createVoucher(payload) {
        return await voucherRepository.create(payload);
    },

    /**
     * Admin cập nhật voucher
     */
    async updateVoucher(id, payload) {
        const exist = await voucherRepository.findById(id);
        if (!exist) throw new Error('Voucher not found');

        return await voucherRepository.update(id, payload);
    },

    /**
     * Admin xoá voucher
     */
    async deleteVoucher(id) {
        const exist = await voucherRepository.findById(id);
        if (!exist) throw new Error('Voucher not found');

        return await voucherRepository.delete(id);
    },

    /**
     * Admin xem tất cả
     */
    async getAllVouchers(filter = {}) {
        return await voucherRepository.findAll(filter);
    },

    /**
     * User xem danh sách voucher có thể thu thập (isCollectable + active + trong thời gian)
     */
    async getCollectableVouchers(userId) {
        const now = new Date();
        const list = await voucherRepository.findAll({
            isActive: true,
            isCollectable: true,
            $and: [
                {
                    $or: [{ startDate: null }, { startDate: { $lte: now } }],
                },
                {
                    $or: [{ endDate: null }, { endDate: { $gte: now } }],
                },
            ],
        });

        // Đánh dấu voucher đã thu thập hay chưa
        if (!userId) return list.map((v) => ({ ...v.toObject(), collected: false }));

        const collected = await userVoucherRepository.findUsableByUser(userId);
        const collectedIds = new Set(
            collected.map((uv) => uv.voucherId?._id?.toString() || uv.voucherId?.toString()),
        );

        return list.map((v) => ({
            ...v.toObject(),
            collected: collectedIds.has(v._id.toString()),
        }));
    },

    /**
     * Kiểm tra voucher có dùng được không
     */
    async validateVoucherForUser(userId, voucherId, goodsTotal) {
        const voucher = await voucherRepository.findById(voucherId);
        if (!voucher) throw new Error('Voucher không tồn tại');

        const now = new Date();
        const startAt = voucher.startDate || voucher.createdAt || now;
        const endAt = voucher.endDate || voucher.expiredAt;
        if (startAt && startAt > now) throw new Error("Voucher chưa bắt đầu");
        if (endAt && endAt < now) throw new Error("Voucher đã hết hạn");

        // Voucher chỉ dành cho user có tài khoản
        if (!userId) {
            throw new Error('Voucher chỉ áp dụng cho khách hàng đã đăng nhập');
        }

        // Kiểm tra user đã collect chưa
        const userVoucher = await userVoucherRepository.findByUserAndVoucher(
            userId,
            voucherId,
        );
        if (!userVoucher) {
            throw new Error('Bạn chưa thu thập voucher này');
        }

        if (userVoucher.used) {
            throw new Error('Voucher đã được sử dụng');
        }

        // Tính giảm giá
        let discount = 0;

        if (voucher.type === 'fixed') {
            discount = voucher.value;
        }

        if (voucher.type === 'percent') {
            discount = Math.floor(goodsTotal * (voucher.value / 100));
            if (voucher.maxDiscount) {
                discount = Math.min(discount, voucher.maxDiscount);
            }
        }

        // Không vượt quá tiền hàng
        discount = Math.min(discount, goodsTotal);

        return {
            voucherId,
            discount,
            voucher,
        };
    },

    /**
     * Lấy danh sách voucher user đã thu thập (chưa dùng)
     */
    async getUsableVouchers(userId) {
        const list = await userVoucherRepository.findUsableByUser(userId);

        return list.map((uv) => ({
            voucherId: uv.voucherId._id,
            name: uv.voucherId.name,
            type: uv.voucherId.type,
            value: uv.voucherId.value,
            maxDiscount: uv.voucherId.maxDiscount,
            expiredAt: uv.voucherId.endDate || uv.voucherId.expiredAt,
            used: uv.used,
        }));
    },

    /**
     * Đánh dấu voucher đã dùng
     */
    async markVoucherUsed(userId, voucherId) {
        const uv = await userVoucherRepository.findByUserAndVoucher(
            userId,
            voucherId,
        );
        if (!uv) throw new Error("User chưa collect voucher này");

        if (uv.used) throw new Error('Voucher đã dùng rồi');

        return await userVoucherRepository.markUsed(userId, voucherId);
    },
};
