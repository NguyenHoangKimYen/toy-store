const CartRepository = require("../repositories/cart.repository");
const Cart = require("../models/cart.model");
const CartItem = require("../models/cart-item.model");
const Variant = require("../models/variant.model");
const getCartByUserOrSession = async ({ userId, sessionId }) => {
    if (userId) {
        return await CartRepository.findCartByUserId(userId);
    }
    return await CartRepository.findCartBySessionId(sessionId);
};

const getOrCreateCart = async (userId, sessionId) => {
    if (userId) {
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = await Cart.create({
                userId,
                items: [],
                totalPrice: 0
            });
        }
        return cart;
    }

    if (sessionId) {
        let cart = await Cart.findOne({ sessionId });
        if (!cart) {
            cart = await Cart.create({
                sessionId,
                items: [],
                totalPrice: 0
            });
        }
        return cart;
    }

    throw new Error("Missing userId or sessionId");
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
    const { variantId, quantity } = itemData;

    const variant = await Variant.findById(variantId);
    if (!variant) throw new Error("Variant not found");

    const productId = variant.productId;
    const unitPrice = Number(variant.price);

    const cartItem = await CartItem.create({
        cartId,
        productId,
        variantId,
        quantity,
        price: unitPrice
    });

    // Recalc tổng giỏ hàng (CartItem.post('save') đã tự chạy)
    return await Cart.findById(cartId).populate("items");
};


const removeItem = async (cartId, cartItemId) => {
    await CartItem.findOneAndDelete({ _id: cartItemId });
    return await Cart.findById(cartId).populate("items");
};


const clearCart = async (cartId) => {
    await CartItem.deleteMany({ cartId });
    return await Cart.findByIdAndUpdate(
        cartId,
        { items: [], totalPrice: 0 },
        { new: true }
    );
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
    getOrCreateCart,
    createCart,
    addItem,
    removeItem,
    clearCart,
    deleteCart,
    getAllCarts,
};