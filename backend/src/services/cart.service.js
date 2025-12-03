const CartRepository = require('../repositories/cart.repository');
const CartItemRepository = require('../repositories/cart-item.repository');
const Cart = require('../models/cart.model');
const CartItem = require('../models/cart-item.model');
const Variant = require('../models/variant.model');
const mongoose = require('mongoose');

// ==========================================
// INTERNAL HELPER FUNCTIONS
// ==========================================

/**
 * Helper to ensure ObjectId type
 */
const toObjectId = (id) => {
    if (!id) return null;
    if (id instanceof mongoose.Types.ObjectId) return id;
    if (typeof id === 'string') return new mongoose.Types.ObjectId(id);
    return id;
};

/**
 * Hàm tính toán lại tổng tiền và tổng số lượng item của Cart
 * OPTIMIZED: Uses lean() for faster query
 */
const _recalculateCartTotals = async (cartId) => {
    const cartIdObj = toObjectId(cartId);
    const items = await CartItem.find({ cartId: cartIdObj }).lean();
    
    let totalPrice = 0;
    let totalItems = 0;

    items.forEach((item) => {
        const price = parseFloat(item.price.toString());
        totalPrice += price * item.quantity;
        totalItems += item.quantity;
    });

    // Cập nhật lại Cart cha
    await CartRepository.update(cartIdObj, {
        items: items.map((item) => item._id),
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
 * Returns cart with populated variant and product data
 * OPTIMIZED: Single query with lean() for better performance
 */
const _getPopulatedCart = async (cartId) => {
    const cartIdObj = toObjectId(cartId);
    
    // Parallel queries with field selection for better performance
    const [cart, cartItems] = await Promise.all([
        Cart.findById(cartIdObj).lean(),
        CartItem.find({ cartId: cartIdObj })
            .populate({
                path: 'variantId',
                select: 'sku price size color attributes stockQuantity imageUrls productId',
                populate: { 
                    path: 'productId',
                    select: 'name slug imageUrls images minPrice maxPrice'
                },
            })
            .lean()
    ]);
    
    if (!cart) return null;

    // Fast mapping with minimal transformations
    const fullItems = cartItems.map((item) => {
        const variant = item.variantId;
        const product = variant?.productId;
        
        return {
            _id: item._id,
            variantId: variant?._id || null,
            variant: variant ? {
                _id: variant._id,
                sku: variant.sku,
                price: toNumber(variant.price),
                size: variant.size,
                color: variant.color,
                attributes: variant.attributes || [],
                stockQuantity: variant.stockQuantity || 0,
                productId: product?._id || null,
                imageUrls: variant.imageUrls || [],
            } : null,
            product: product ? {
                _id: product._id,
                name: product.name,
                slug: product.slug,
                imageUrls: product.imageUrls || product.images || [],
                minPrice: product.minPrice || 0,
                maxPrice: product.maxPrice || 0,
            } : null,
            quantity: item.quantity,
            price: toNumber(item.price),
        };
    });
    
    return {
        ...cart,
        items: fullItems,
        totalPrice: toNumber(cart.totalPrice),
    };
};

// ==========================================
// MAIN SERVICE FUNCTIONS
// ==========================================

// Debug logging
const log = (...args) => console.log('[cart.service]', ...args);

const getCartByUserOrSession = async ({ userId, sessionId }) => {
    log('getCartByUserOrSession called:', { userId, sessionId });
    let cartDoc = null;
    
    // 1. Tìm Cart
    if (userId) {
        log('Finding cart by userId:', userId);
        cartDoc = await CartRepository.findCartByUserId(userId);
        log('findCartByUserId result:', cartDoc ? `cartId=${cartDoc._id}` : 'null');
    } else if (sessionId) {
        log('Finding cart by sessionId:', sessionId);
        cartDoc = await CartRepository.findCartBySessionId(sessionId);
        log('findCartBySessionId result:', cartDoc ? `cartId=${cartDoc._id}` : 'null');
    }

    if (!cartDoc) {
        log('No cart found, returning null');
        return null;
    }

    // Use the shared helper for consistent cart structure
    log('Fetching populated cart for cartId:', cartDoc._id);
    const result = await _getPopulatedCart(cartDoc._id);
    log('_getPopulatedCart result:', result ? `items=${result.items?.length}` : 'null');
    
    if (result?.items) {
        log('Items:', result.items.map(i => ({ variantId: i.variantId, qty: i.quantity })));
    }
    
    return result;
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
    
    // Convert IDs to ObjectId for proper MongoDB matching
    const cartIdObj = toObjectId(cartId);
    const variantIdObj = toObjectId(variantId);
    
    const variant = await Variant.findById(variantIdObj).populate('productId');
    if (!variant) throw new Error('Variant not found');
    const unitPrice = Number(variant.price);

    let cartItem = await CartItem.findOne({ cartId: cartIdObj, variantId: variantIdObj });

    if (cartItem) {
        const newQuantity = cartItem.quantity + quantity;
        if (newQuantity > variant.stockQuantity) throw new Error(`Not enough stock.`);
        cartItem.quantity = newQuantity;
        cartItem.price = unitPrice;
        await cartItem.save();
    } else {
        if (quantity > variant.stockQuantity) throw new Error(`Not enough stock.`);
        await CartItem.create({
            cartId: cartIdObj,
            productId: variant.productId._id,
            variantId: variantIdObj,
            quantity,
            price: unitPrice,
        });
    }

    await _recalculateCartTotals(cartIdObj);
    
    // Return fully populated cart
    return await _getPopulatedCart(cartIdObj);
};

/**
 * XÓA 1 ITEM KHỎI GIỎ
 */
const removeItem = async (cartId, itemData) => {
    const { variantId, quantity } = itemData;
    
    // Convert IDs to ObjectId for proper MongoDB matching
    const cartIdObj = toObjectId(cartId);
    const variantIdObj = toObjectId(variantId);
    
    const cartItem = await CartItem.findOne({ cartId: cartIdObj, variantId: variantIdObj });
    
    if (!cartItem) {
        throw new Error('Sản phẩm không có trong giỏ hàng');
    }

    const newQuantity = cartItem.quantity - quantity;

    if (newQuantity > 0) {
        cartItem.quantity = newQuantity;
        await cartItem.save();
    } else {
        await CartItem.findOneAndDelete({ _id: cartItem._id });
    }

    await _recalculateCartTotals(cartIdObj);
    
    // Return fully populated cart
    return await _getPopulatedCart(cartIdObj);
};

/**
 * XÓA SẠCH GIỎ HÀNG
 */
const clearCart = async (cartId) => {
    const mongoose = require('mongoose');
    const objectId = new mongoose.Types.ObjectId(cartId);
    
    // Xóa tất cả item con
    const deleteResult = await CartItem.deleteMany({ cartId: objectId });
    console.log(`[clearCart] Deleted ${deleteResult.deletedCount} items from cart ${cartId}`);

    // Reset Cart cha
    await Cart.findByIdAndUpdate(
        objectId,
        { items: [], totalPrice: 0, totalItems: 0 },
        { new: true },
    );
    
    // Return consistent structure (empty cart with items array)
    return {
        _id: objectId,
        items: [],
        totalPrice: 0,
        totalItems: 0,
    };
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

    // 3. Merge Logic - Optimized with bulk operations
    // Fetch all variants at once to avoid N+1 queries
    const variantIds = guestCartItems.map(item => item.variantId);
    const variants = await Variant.find({ 
        _id: { $in: variantIds },
        stockQuantity: { $gt: 0 }
    }).lean();
    
    const variantMap = new Map(variants.map(v => [v._id.toString(), v]));
    
    const bulkOps = [];
    const newItems = [];
    
    for (const guestItem of guestCartItems) {
        const variant = variantMap.get(guestItem.variantId.toString());
        if (!variant) continue;

        const existingUserItem = userCartItems.find(
            (item) =>
                item.variantId.toString() === guestItem.variantId.toString(),
        );

        if (existingUserItem) {
            // Cộng dồn - prepare bulk update
            const newQuantity = existingUserItem.quantity + guestItem.quantity;
            const maxQuantity = Math.min(newQuantity, variant.stockQuantity);

            bulkOps.push({
                updateOne: {
                    filter: { _id: existingUserItem._id },
                    update: { 
                        $set: { 
                            quantity: maxQuantity,
                            price: variant.price 
                        }
                    }
                }
            });
        } else {
            // Tạo mới sang giỏ User
            const quantity = Math.min(
                guestItem.quantity,
                variant.stockQuantity,
            );
            newItems.push({
                cartId: userCart._id,
                productId: guestItem.productId,
                variantId: guestItem.variantId,
                quantity,
                price: variant.price,
            });
        }
    }
    
    // Execute bulk operations
    if (bulkOps.length > 0) {
        await CartItem.bulkWrite(bulkOps);
    }
    
    if (newItems.length > 0) {
        const createdItems = await CartItem.insertMany(newItems);
        await Cart.updateOne(
            { _id: userCart._id },
            { $push: { items: { $each: createdItems.map(item => item._id) } } },
        );
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
