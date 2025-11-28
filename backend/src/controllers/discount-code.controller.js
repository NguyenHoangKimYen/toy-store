const discountService = require("../services/discount-code.service");

module.exports = {
    async create(req, res) {
        try {
            const data = { ...req.body, createdBy: req.user?.id };
            const doc = await discountService.createDiscountCode(data);
            return res.json({ success: true, data: doc });
        } catch (err) {
            console.error(err);
            return res
                .status(400)
                .json({ success: false, message: err.message });
        }
    },

    async update(req, res) {
        try {
            const id = req.params.id;
            const data = req.body;
            const updated = await discountService.updateDiscountCode(id, data);

            return res.json({ success: true, data: updated });
        } catch (err) {
            console.error(err);
            return res
                .status(400)
                .json({ success: false, message: err.message });
        }
    },

    async delete(req, res) {
        try {
            const id = req.params.id;
            await discountService.deleteDiscountCode(id);

            return res.json({ success: true, message: "Deleted successfully" });
        } catch (err) {
            console.error(err);
            return res
                .status(400)
                .json({ success: false, message: err.message });
        }
    },

    async getAll(req, res) {
        try {
            const list = await discountService.getAll(req.query);
            return res.json({ success: true, data: list });
        } catch (err) {
            console.error(err);
            return res
                .status(400)
                .json({ success: false, message: err.message });
        }
    },

    async validate(req, res) {
        try {
            const { code, totalAmount, userId } = req.body;

            const result = await discountService.validateByCode({
                code,
                totalAmount: Number(totalAmount),
                userId: userId || req.user?.id,
            });

            return res.json({ success: true, data: result });
        } catch (err) {
            console.error(err);
            return res
                .status(400)
                .json({ success: false, message: err.message });
        }
    },
};
