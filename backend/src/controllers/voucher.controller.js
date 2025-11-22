const voucherService = require("../services/voucher.service");
const voucherCollectService = require("../services/voucher-collect.service");

module.exports = {
    // --- ADMIN ---
    async createVoucher(req, res) {
        try {
            const result = await voucherService.createVoucher(req.body);
            return res.json({ success: true, voucher: result });
        } catch (err) {
            return res.status(400).json({ success: false, message: err.message });
        }
    },

    async updateVoucher(req, res) {
        try {
            const result = await voucherService.updateVoucher(req.params.id, req.body);
            return res.json({ success: true, voucher: result });
        } catch (err) {
            return res.status(400).json({ success: false, message: err.message });
        }
    },

    async deleteVoucher(req, res) {
        try {
            const result = await voucherService.deleteVoucher(req.params.id);
            return res.json({ success: true, result });
        } catch (err) {
            return res.status(400).json({ success: false, message: err.message });
        }
    },

    async getAllVouchers(req, res) {
        const list = await voucherService.getAllVouchers(req.query);
        return res.json({ success: true, vouchers: list });
    },

    // --- USER ---
    async getUsableVouchers(req, res) {
        try {
            const list = await voucherService.getUsableVouchers(req.user.id);
            return res.json({ success: true, vouchers: list });
        } catch (err) {
            return res.status(400).json({ success: false, message: err.message });
        }
    },

    async collectVoucher(req, res) {
        try {
            const userId = req.user.id;
            const { voucherId } = req.body;

            const result = await voucherCollectService.collectVoucher(userId, voucherId);

            return res.json({ success: true, data: result });

        } catch (err) {
            return res.status(400).json({ success: false, message: err.message });
        }
    },

    async getMyVouchers(req, res) {
        try {
            const userId = req.user.id;
            const list = await voucherCollectService.getUserVouchers(userId);

            return res.json({ success: true, vouchers: list });
        } catch (err) {
            return res.status(400).json({ success: false, message: err.message });
        }
    }
};
