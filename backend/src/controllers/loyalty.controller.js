const loyaltyService = require('../services/loyalty.service');

module.exports = {
    // Get loyalty configuration (tiers, benefits, etc.)
    async getConfig(req, res) {
        try {
            const config = loyaltyService.getLoyaltyConfig();
            return res.json({ success: true, data: config });
        } catch (err) {
            console.error(err);
            return res
                .status(400)
                .json({ success: false, message: err.message });
        }
    },

    async getMyLoyalty(req, res) {
        try {
            const userId = req.user.id;
            const info = await loyaltyService.getMyLoyaltyInfo(userId);

            return res.json({ success: true, data: info });
        } catch (err) {
            console.error(err);
            return res
                .status(400)
                .json({ success: false, message: err.message });
        }
    },

    async getMyCoinTransactions(req, res) {
        try {
            const userId = req.user.id;
            const limit = Number(req.query.limit) || 50;

            const tx = await loyaltyService.getMyCoinTransactions(
                userId,
                limit,
            );

            return res.json({ success: true, data: tx });
        } catch (err) {
            console.error(err);
            return res
                .status(400)
                .json({ success: false, message: err.message });
        }
    },

    // ⭐ thêm hàm này
    async getHistory(req, res) {
        try {
            const userId = req.user.id;
            const history = await loyaltyService.getMyCoinTransactions(
                userId,
                200,
            );

            return res.json({ success: true, data: history });
        } catch (err) {
            console.error(err);
            return res
                .status(400)
                .json({ success: false, message: err.message });
        }
    },

    // ⭐ thêm hàm này (nếu có reward shop)
    async redeemCoins(req, res) {
        try {
            const userId = req.user.id;
            const { amount } = req.body;

            const result = await loyaltyService.redeemCoins(userId, amount);

            return res.json({ success: true, data: result });
        } catch (err) {
            console.error(err);
            return res
                .status(400)
                .json({ success: false, message: err.message });
        }
    },
};
