const orderService = require('../services/order.service');

module.exports = {
    async create(req, res) {
        try {
            const result = await orderService.createOrder(req.body);
            return res.json({ success: true, order: result });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: err.message });
        }
    },

    async getDetail(req, res) {
        const order = await orderService.getOrderDetail(req.params.id);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        return res.json({ success: true, order });
    },

    async getMyOrders(req, res) {
        const orders = await orderService.getOrdersByUser(req.user._id);
        return res.json({ success: true, orders });
    },

    async adminGetAll(req, res) {
        const orders = await orderService.getAll(req.query, req.query);
        return res.json({ success: true, orders });
    },

    async updateStatus(req, res) {
        const updated = await orderService.updateStatus(req.params.id, req.body.status);
        if (!updated) return res.status(404).json({ success: false, message: 'Order not found' });

        return res.json({ success: true, order: updated });
    }
};
