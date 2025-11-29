const CartRepository = require('../repositories/cart.repository');
const CartItemRepository = require('../repositories/cart-item.repository');
const Cart = require('../models/cart.model');
const CartItem = require('../models/cart-item.model');
const Variant = require('../models/variant.model');

// ==========================================
// INTERNAL HELPER FUNCTIONS
// ==========================================

/**
 * Hàm tính toán lại tổng tiền và tổng số lượng item của Cart
 * Giúp đồng bộ dữ liệu chính xác tuyệt đối, tránh lỗi cộng dồn sai.
 */
const _recalculateCartTotals = async (cartId) => {
    const items = await CartItem.find({ cartId });
    let totalPrice = 0;
    let totalItems = 0;

    items.forEach((item) => {
        const price = parseFloat(item.price.toString());
        totalPrice += price * item.quantity;
        totalItems += item.quantity;
    });

    // Cập nhật lại Cart cha (Sync ID và tổng tiền)
    await CartRepository.update(cartId, {
        items: items.map((item) => item._id), // Lưu ID để tham chiếu
        totalPrice,
        totalItems,
    });
};

// ==========================================
// MAIN SERVICE FUNCTIONS
// ==========================================

// src/services/cart.service.js

const getCartByUserOrSession = async ({ userId, sessionId }) => {
    let cartDoc = null;
    
    // 1. Tìm Cart
    if (userId) {
        cartDoc = await CartRepository.findCartByUserId(userId);
    } else if (sessionId) {
        cartDoc = await CartRepository.findCartBySessionId(sessionId);
    }

    if (!cartDoc) return null;

    // 2. Chuyển sang Object để xử lý
    const cart = cartDoc.toObject();

    // 3. [FIX] POPULATE MẠNH MẼ HƠN
    // Ta sẽ populate cả 2 đường:
    // - Đường 1: productId trực tiếp (để dự phòng)
    // - Đường 2: variantId -> rồi lồng vào productId bên trong variant
    
    const fullItems = await CartItem.find({ cartId: cart._id })
        .populate({
            path: 'variantId',   // Populate trường variantId
            model: 'Variant',    // Chỉ định rõ Model là 'Variant'
            populate: {
                path: 'productId', // Tiếp tục populate productId bên trong Variant
                model: 'Product',  // Chỉ định rõ Model
                select: 'name imageUrls slug'
            }
        });

    // 4. Gán items đã populate vào cart
    cart.items = fullItems;

    return cart;
};

const createCart = async ({ userId, sessionId }) => {
    const existing = await getCartByUserOrSession({ userId, sessionId });
    if (existing) return existing;

    const newCartData = { items: [], totalPrice: 0, totalItems: 0 };
    if (userId) newCartData.userId = userId;
    else if (sessionId) newCartData.sessionId = sessionId;
    else throw new Error('Either userId or sessionId must be provided');

    return await CartRepository.create(newCartData);
};

/**
 * THÊM SẢN PHẨM VÀO GIỎ (Logic gộp + Kiểm tra tồn kho)
 */
const addItem = async (cartId, itemData) => {
    const { variantId, quantity } = itemData;
    const variant = await Variant.findById(variantId).populate('productId');
    if (!variant) throw new Error('Variant not found');
    const unitPrice = Number(variant.price);

    let cartItem = await CartItem.findOne({ cartId, variantId });

    if (cartItem) {
        const newQuantity = cartItem.quantity + quantity;
        if (newQuantity > variant.stockQuantity) throw new Error(`Not enough stock.`);
        cartItem.quantity = newQuantity;
        cartItem.price = unitPrice;
        await cartItem.save();
    } else {
        if (quantity > variant.stockQuantity) throw new Error(`Not enough stock.`);
        await CartItem.create({
            cartId,
            productId: variant.productId._id,
            variantId,
            quantity,
            price: unitPrice,
        });
    }

    await _recalculateCartTotals(cartId);
    // Gọi lại hàm get đầy đủ thông tin để trả về
    return await getCartByUserOrSession({ userId: null, sessionId: null }).then(() => Cart.findById(cartId));
};

/**
 * XÓA 1 ITEM KHỎI GIỎ
 */
const removeItem = async (cartId, itemData) => {
    const { variantId, quantity } = itemData;
    const cartItem = await CartItem.findOne({ cartId, variantId });
    if (!cartItem) throw new Error('Sản phẩm không có trong giỏ hàng');

    const variant = await Variant.findById(variantId);
    const unitPrice = variant ? Number(variant.price) : cartItem.price;
    const newQuantity = cartItem.quantity - quantity;

    if (newQuantity > 0) {
        cartItem.quantity = newQuantity;
        cartItem.price = unitPrice;
        await cartItem.save();
    } else {
        await CartItem.findOneAndDelete({ _id: cartItem._id });
    }

    await _recalculateCartTotals(cartId);
    return await Cart.findById(cartId);
};

/**
 * XÓA SẠCH GIỎ HÀNG
 */
const clearCart = async (cartId) => {
    // Xóa tất cả item con
    await CartItem.deleteMany({ cartId });

    // Reset Cart cha
    return await Cart.findByIdAndUpdate(
        cartId,
        { items: [], totalPrice: 0, totalItems: 0 },
        { new: true },
    );
};

const deleteCart = async (cartId) => {
    await CartItem.deleteMany({ cartId });
    // [SỬA TẠI ĐÂY] Đổi .delete thành .remove
    return await CartRepository.remove(cartId);
};

const getAllCarts = async () => {
    return await CartRepository.getAll();
};

/**
 * HỢP NHẤT GIỎ HÀNG (GUEST -> USER)
 */
const mergeGuestCartIntoUserCart = async (userId, sessionId) => {
    if (!sessionId) return null;

    // 1. Tìm giỏ hàng Guest
    const guestCart = await Cart.findOne({ sessionId });
    if (!guestCart) return null;

    const guestCartItems = await CartItem.find({ cartId: guestCart._id });
    if (guestCartItems.length === 0) {
        await Cart.deleteOne({ _id: guestCart._id });
        return null;
    }

    // 2. Tìm hoặc tạo giỏ hàng User
    let userCart = await Cart.findOne({ userId });
    if (!userCart) {
        userCart = await Cart.create({ userId, items: [], totalPrice: 0 });
    }

    const userCartItems = await CartItem.find({ cartId: userCart._id });

    // 3. Merge Logic
    for (const guestItem of guestCartItems) {
        const variant = await Variant.findById(guestItem.variantId);
        if (!variant || variant.stockQuantity <= 0) continue;

        const existingUserItem = userCartItems.find(
            (item) =>
                item.variantId.toString() === guestItem.variantId.toString(),
        );

        if (existingUserItem) {
            // Cộng dồn
            const newQuantity = existingUserItem.quantity + guestItem.quantity;
            const maxQuantity = Math.min(newQuantity, variant.stockQuantity);

            existingUserItem.quantity = maxQuantity;
            existingUserItem.price = variant.price;
            await existingUserItem.save();
        } else {
            // Tạo mới sang giỏ User
            const quantity = Math.min(
                guestItem.quantity,
                variant.stockQuantity,
            );
            const newItem = await CartItem.create({
                cartId: userCart._id,
                productId: guestItem.productId,
                variantId: guestItem.variantId,
                quantity,
                price: variant.price,
            });

            // Push vào mảng items của User Cart
            await Cart.updateOne(
                { _id: userCart._id },
                { $push: { items: newItem._id } },
            );
        }
    }

    // 4. Dọn dẹp giỏ Guest
    await CartItem.deleteMany({ cartId: guestCart._id });
    await Cart.deleteOne({ _id: guestCart._id });

    // 5. Tính toán lại tổng tiền cho giỏ User sau khi merge
    await _recalculateCartTotals(userCart._id);

    return await Cart.findById(userCart._id).populate({
        path: 'items',
        populate: { path: 'variantId productId' },
    });
};

module.exports = {
    getCartByUserOrSession,
    createCart,
    addItem,
    removeItem,
    clearCart,
    deleteCart,
    getAllCarts,
    mergeGuestCartIntoUserCart,
};
