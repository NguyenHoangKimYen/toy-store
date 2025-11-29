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

/**
 * Helper function to convert Decimal128 to number
 */
const toNumber = (value) => {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;
    if (value.$numberDecimal) return parseFloat(value.$numberDecimal);
    if (typeof value.toString === 'function') return parseFloat(value.toString());
    return 0;
};

/**
 * Helper function to get fully populated cart with items
 * Used by addItem, removeItem to return consistent cart structure for socket emission
 */
const _getPopulatedCartForSocket = async (cartId) => {
    const cart = await Cart.findById(cartId);
    if (!cart) return null;
    
    const cartItems = await CartItem.find({ cartId })
        .populate({
            path: 'variantId',
            populate: { path: 'productId' },
        })
        .lean();

    const fullItems = cartItems.map((item) => {
        const variant = item.variantId;
        const product = variant?.productId;
        
        return {
            _id: item._id,
            variantId: variant?._id || null,
            variant: variant
                ? {
                      _id: variant._id,
                      sku: variant.sku,
                      price: toNumber(variant.price),
                      size: variant.size,
                      color: variant.color,
                      attributes: variant.attributes || [],
                      stockQuantity: variant.stockQuantity || 0,
                      productId: product?._id || null,
                      imageUrls: variant.imageUrls || [],
                  }
                : null,
            product: product
                ? {
                      _id: product._id,
                      name: product.name,
                      slug: product.slug,
                      imageUrls: product.imageUrls || product.images || [],
                      minPrice: product.minPrice || 0,
                      maxPrice: product.maxPrice || 0,
                  }
                : null,
            quantity: item.quantity,
            price: toNumber(item.price),
        };
    });

    const cartObj = cart.toObject();
    
    const result = {
        ...cartObj,
        items: fullItems,
        totalPrice: toNumber(cartObj.totalPrice), // Convert Decimal128 to number
    };

    return result;
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

    // Use the shared helper for consistent cart structure
    return await _getPopulatedCartForSocket(cartDoc._id);
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
    
    // Return fully populated cart for socket emission
    return await _getPopulatedCartForSocket(cartId);
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
    
    // Return fully populated cart for socket emission
    return await _getPopulatedCartForSocket(cartId);
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
