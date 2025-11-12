const OrderService = require("../services/order.service");

const createOrder = async (req, res) => {
    try {
        const order = await OrderService.createOrderFromCart(req.body);
        res.status(201).json(order);
    } catch (error) {
        console.error("❌ Lỗi tạo đơn hàng:", error);
        res.status(400).json({ message: error.message });
    }
};

const getUserOrders = async (req, res) => {
    try {
        const orders = await OrderService.getOrdersByUser(req.params.userId);
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getOrderById = async (req, res) => {
    try {
        const order = await OrderService.getOrderById(req.params.id);
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const updated = await OrderService.updateOrderStatus(
            req.params.id,
            status,
        );
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllOrders = async (req, res) => {
    try {
        const orders = await OrderService.getAllOrders();
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createOrder,
    getUserOrders,
    getOrderById,
    updateStatus,
    getAllOrders,
};
