const orderRepo = require('../repositories/order.repository');
const itemRepo = require('../repositories/order-item.repository');
const historyRepo = require('../repositories/order-status-history.repository');

const addressRepo = require('../repositories/address.repository');
const paymentRepo = require('../repositories/payment.repository'); // cần tạo nếu chưa có
const { calculateShippingFee } = require('../services/shipping.service');
const { getWeatherCondition } = require('../services/weather.service');

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

    // ⭐⭐⭐ Lấy chi tiết đơn hàng — FULL SHIP + PAYMENT + WEATHER
    async getOrderDetail(orderId) {
        const order = await orderRepo.findById(orderId);
        if (!order) return null;

        // Items
        const items = await itemRepo.findByOrder(orderId);

        // Status history
        const history = await historyRepo.getHistory(orderId);

        // Address để tính ship + weather
        const address = await addressRepo.findById(order.addressId);

        // Weather
        const weather = await getWeatherCondition(address.lat, address.lng);

        // Shipping fee
        const shipping = await calculateShippingFee(
            {
                lat: address.lat,
                lng: address.lng,
                addressLine: address.addressLine,
            },
            500,                             // tạm thời: trọng lượng mặc định
            Number(order.totalAmount),       // tổng tiền
            false,                           // freeship hay không
            "standard"                       // loại giao hàng
        );

        // Thêm weather vào shipping
        shipping.weather = weather;

        // Payment
        const payment = await paymentRepo.findByOrderId(orderId);

        // Trả về order detail đầy đủ
        return {
            ...order,
            items,
            history,
            shipping,
            payment
        };
    },

    // Lấy toàn bộ đơn của user
    getOrdersByUser(userId) {
        return orderRepo.findByUser(userId);
    },

    // Admin: lấy tất cả
    getAll(filter, options) {
        return orderRepo.findAll(filter, options);
    },

    async updateStatus(orderId, newStatus) {
        const updated = await orderRepo.updateStatus(orderId, newStatus);
        if (!updated) return null;

        await historyRepo.add(orderId, newStatus);
        return updated;
    }
};
