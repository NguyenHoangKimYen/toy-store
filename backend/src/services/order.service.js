const OrderRepository = require("../repositories/order.repository");
const CartService = require("./cart.service");
const CartItemService = require("./cart-item.service");
const mongoose = require("mongoose");

const createOrderFromCart = async ({
    userId,
    addressId,
    discountCodeId,
    pointsUsed = 0,
}) => {
    // Lấy giỏ hàng của user
    const cart = await CartService.getCartByUserId(userId);
    if (!cart || cart.items.length === 0) {
        throw new Error("Giỏ hàng trống, không thể tạo đơn hàng");
    }

    // Tính tổng tiền
    let totalAmount = 0;
    for (const item of cart.items) {
        const populatedItem = await CartItemService.getItemById(
            item._id || item,
        );
        totalAmount += parseFloat(populatedItem.price.toString());
    }

    // Giảm giá (nếu có)
    // 👉 bạn có thể sau này thêm logic discountCodeService.apply()
    // hoặc điểm thưởng
    const discount = 0; // tạm bỏ qua
    const finalAmount = totalAmount - discount;

    // Tạo dữ liệu order
    const orderData = {
        userId,
        addressId,
        discountCodeId: discountCodeId || null,
        totalAmount: finalAmount,
        pointsUsed,
        pointsEarned: Math.floor(finalAmount / 100000), // ví dụ: 1 điểm/100k
        status: "pending",
    };

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const order = await OrderRepository.create(orderData);

        // ✅ Sau khi tạo đơn hàng, xóa giỏ hàng
        await CartService.clearCart(cart._id);

        await session.commitTransaction();
        session.endSession();

        return order;
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

const getOrdersByUser = async (userId) => {
    return await OrderRepository.findAllByUserId(userId);
};

const getOrderById = async (orderId) => {
    return await OrderRepository.findById(orderId);
};

const updateOrderStatus = async (orderId, status) => {
    return await OrderRepository.update(orderId, { status });
};

const getAllOrders = async () => {
    return await OrderRepository.getAll();
};

module.exports = {
    createOrderFromCart,
    getOrdersByUser,
    getOrderById,
    updateOrderStatus,
    getAllOrders,
};
