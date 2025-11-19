const CartRepository = require("../repositories/cart.repository");
const CartItem = require("../models/cart-item.model");

const getCartByUserOrSession = async ({ userId, sessionId }) => {
    if (userId) {
        return await CartRepository.findCartByUserId(userId);
    }
    return await CartRepository.findCartBySessionId(sessionId);
};

// Tạo giỏ hàng mới nếu chưa tồn tại
const createCart = async ({ userId, sessionId }) => {
    const existing = await getCartByUserOrSession({ userId, sessionId });
    if (existing) return existing;

    const newCart = {
        userId: userId || null,
        sessionId: sessionId || null,
        items: [],
        totalPrice: 0,
    };
    return await CartRepository.create(newCart);
};

const addItem = async (cartId, itemData) => {
    const { productId, variantId, quantity, price } = itemData;

    // 1. Tạo CartItem mới
    const cartItem = await CartItem.create({
        productId,
        variantId,
        quantity,
        price,
        subtotal: quantity * price
    });

    // 2. Cập nhật giỏ
    const updatedCart = await CartRepository.update(cartId, {
        $push: { items: cartItem._id },
        $inc: { totalPrice: cartItem.subtotal }
    });

    return updatedCart;
};

// const removeItem = async (cartId, cartItemId, itemPrice) => {
//     const cart = await CartRepository.update(cartId, {
//         $pull: { items: cartItemId },
//         $inc: { totalPrice: -itemPrice },
//     });
//     return cart;
// };

const clearCart = async (cartId) => {
    return await CartRepository.update(cartId, {
        items: [],
        totalPrice: 0,
    });
};

// Xóa giỏ hàng (phía admin)
const deleteCart = async (cartId) => {
    return await CartRepository.delete(cartId);
};

// Lấy tất cả giỏ hàng (phía admin)
const getAllCarts = async () => {
    return await CartRepository.getAll();
};

module.exports = {
    getCartByUserOrSession,
    createCart,
    // addItem,
    // removeItem,
    clearCart,
    deleteCart,
    getAllCarts,
};