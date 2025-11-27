const orderService = require("../services/order.service");
const loyaltyService = require("../services/loyalty.service");
const badgeService = require("../services/badge.service");

module.exports = {
    async create(req, res) {
        try {
            const result = await orderService.createOrder(req.body);
            return res.json({ success: true, order: result });
        } catch (err) {
            console.error(err);
            return res
                .status(500)
                .json({ success: false, message: err.message });
        }
    },

    async getDetail(req, res) {
        const order = await orderService.getOrderDetail(req.params.id);
        if (!order)
            return res
                .status(404)
                .json({ success: false, message: "Order not found" });

        return res.json({ success: true, order });
    },

    async getMyOrders(req, res) {
        const orders = await orderService.getOrdersByUser(req.user._id);
        return res.json({ success: true, orders });
    },

    // Checkout từ cart cho user login
    async checkoutFromCartForUser(req, res, next) {
        try {
            const userId = req.user.id;
            const { addressId, discountCodeId, pointsToUse, voucherId, paymentMethod, deliveryType } =
                req.body;

            const detail = await orderService.createOrderFromCart({
                userId,
                addressId,
                discountCodeId: discountCodeId || null,
                voucherId: voucherId || null,
                pointsToUse: Number(pointsToUse) || 0,
                paymentMethod: paymentMethod || 'cashondelivery',
                deliveryType: deliveryType || 'standard',
            });

            res.status(201).json({ success: true, data: detail });
        } catch (err) {
            next(err);
        }
    },

    // Checkout từ cart cho guest (session)
    async checkoutFromCartForGuest(req, res, next) {
        try {
            const { sessionId, guestInfo, discountCodeId, pointsToUse, paymentMethod } =
                req.body;

            const detail = await orderService.createOrderFromCart({
                sessionId,
                guestInfo,
                discountCodeId: discountCodeId || null,
                pointsToUse: Number(pointsToUse) || 0,
                paymentMethod: paymentMethod || 'cashondelivery',
            });

            res.status(201).json({ success: true, data: detail });
        } catch (err) {
            next(err);
        }
    },

    async adminGetAll(req, res) {
        const orders = await orderService.getAll(req.query, req.query);
        return res.json({ success: true, orders });
    },

    async updateStatus(req, res) {
        try {
            const updated = await orderService.updateStatus(
                req.params.id,
                req.body.status,
            );
            if (!updated)
                return res
                    .status(404)
                    .json({ success: false, message: "Order not found" });

            return res.json({
                success: true,
                order: updated,
                newBadges: updated.newBadges || [],
            });
        } catch (err) {
            console.error("Update Order Status Error:", err);
            return res
                .status(500)
                .json({ success: false, message: err.message });
        }
    },

    async getOrdersByDiscountCode(req, res) {
        try {
            const { discountCodeId } = req.params;
            const orders = await orderService.getOrdersByDiscountCode(discountCodeId);
            return res.json({ success: true, orders });
        } catch (err) {
            console.error("Get Orders By Discount Code Error:", err);
            return res
                .status(500)
                .json({ success: false, message: err.message });
        }
    },
};
