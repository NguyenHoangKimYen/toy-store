const orderRepo = require('../repositories/order.repository');
const itemRepo = require('../repositories/order-item.repository');
const historyRepo = require('../repositories/order-status-history.repository');

module.exports = {
    // Tạo đơn hàng
    async createOrder({ userId, addressId, items, totalAmount, discountCodeId }) {

        const order = await orderRepo.create({
            userId,
            addressId,
            discountCodeId: discountCodeId || null,
            totalAmount,
            pointsUsed: 0,
            pointsEarned: 0,
        });

        const orderItems = items.map((it) => ({
            orderId: order._id,
            productId: it.productId,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            subtotal: it.subtotal,
        }));

        await itemRepo.createMany(orderItems);

        await historyRepo.add(order._id, 'pending');

        return order;
    },

    // Lấy chi tiết đơn hàng
    async getOrderDetail(orderId) {
        const order = await orderRepo.findById(orderId);
        if (!order) return null;

        const items = await itemRepo.findByOrder(orderId);
        const history = await historyRepo.getHistory(orderId);

        return { ...order, items, history };
    },

    // Lấy toàn bộ đơn của user
    getOrdersByUser(userId) {
        return orderRepo.findByUser(userId);
    },

    // Admin: lấy tất cả
    getAll(filter, options) {
        return orderRepo.findAll(filter, options);
    },

    // Update trạng thái
    async updateStatus(orderId, newStatus) {
        const updated = await orderRepo.updateStatus(orderId, newStatus);
        if (!updated) return null;

        await historyRepo.add(orderId, newStatus);
        return updated;
    }
};
