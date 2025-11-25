const CartRepository = require("../repositories/cart.repository");
const CartItemRepository = require("../repositories/cart-item.repository"); 
const Cart = require("../models/cart.model");
const CartItem = require("../models/cart-item.model");
const Variant = require("../models/variant.model");

// ==========================================
// INTERNAL HELPER FUNCTIONS
// ==========================================

/**
 * Hàm tính toán lại tổng tiền và tổng số lượng item của Cart
 * Giúp đồng bộ dữ liệu chính xác tuyệt đối, tránh lỗi cộng dồn sai.
 */
const _recalculateCartTotals = async (cartId) => {
    // 1. Lấy tất cả item thực tế đang có trong DB
    const items = await CartItem.find({ cartId });
    
    let totalPrice = 0;
    
    // 2. Tính tổng tiền
    items.forEach(item => {
        const price = parseFloat(item.price.toString());
        totalPrice += (price * item.quantity);
    });

    // 3. [SỬA TẠI ĐÂY] Cập nhật mảng items luôn (Sync)
    // Lấy danh sách _id từ kết quả tìm được gán thẳng vào mảng items
    // Điều này giúp loại bỏ ID rác hoặc ID trùng lặp
    await CartRepository.update(cartId, { 
        items: items.map(item => item._id), // <--- Dòng này sửa lỗi trùng lặp của bạn
        totalPrice,
        totalItems: items.length 
    });
};
// ==========================================
// MAIN SERVICE FUNCTIONS
// ==========================================

const getCartByUserOrSession = async ({ userId, sessionId }) => {
    let cart = null;
    if (userId) {
        cart = await CartRepository.findCartByUserId(userId);
    } else if (sessionId) {
        cart = await CartRepository.findCartBySessionId(sessionId);
    }
    
    // Nếu tìm thấy cart, populate full items để trả về FE
    if (cart) {
        return await Cart.findById(cart._id).populate({
            path: 'items',
            populate: { path: 'variantId productId' } // Populate sâu lấy info SP
        });
    }
    return null;
};

const createCart = async ({ userId, sessionId }) => {
    // Kiểm tra xem đã có cart chưa
    const existing = await getCartByUserOrSession({ userId, sessionId });
    if (existing) return existing;

    const newCartData = { items: [], totalPrice: 0, totalItems: 0 };
    
    if (userId) newCartData.userId = userId;
    else if (sessionId) newCartData.sessionId = sessionId;
    else throw new Error("Either userId or sessionId must be provided");

    return await CartRepository.create(newCartData);
};

/**
 * THÊM SẢN PHẨM VÀO GIỎ (Logic gộp + Kiểm tra tồn kho)
 */
const addItem = async (cartId, itemData) => {
    const { variantId, quantity } = itemData;

    // ... (Phần validate variant và stock giữ nguyên) ...
    const variant = await Variant.findById(variantId).populate("productId");
    if (!variant) throw new Error("Variant not found");
    const unitPrice = Number(variant.price);

    let cartItem = await CartItem.findOne({ cartId, variantId });

    if (cartItem) {
        // ... (Phần cộng dồn số lượng giữ nguyên) ...
        const newQuantity = cartItem.quantity + quantity;
        if (newQuantity > variant.stockQuantity) {
            throw new Error(`Not enough stock...`);
        }
        cartItem.quantity = newQuantity;
        cartItem.price = unitPrice;
        await cartItem.save();
    } else {
        // ... (Phần tạo mới) ...
        if (quantity > variant.stockQuantity) {
            throw new Error(`Not enough stock...`);
        }

        cartItem = await CartItem.create({
            cartId,
            productId: variant.productId._id,
            variantId,
            quantity,
            price: unitPrice,
        });
        
        // [XÓA DÒNG NÀY] Không cần push thủ công nữa
        // await CartRepository.update(cartId, { $push: { items: cartItem._id } }); 
    }

    // 3. Tính lại tổng tiền & Đồng bộ danh sách Items
    await _recalculateCartTotals(cartId); // <--- Hàm này sẽ tự nhét ID mới vào mảng

    // 4. Trả về kết quả
    return await Cart.findById(cartId).populate({
        path: 'items',
        populate: { path: 'variantId productId' }
    });
};

/**
 * XÓA 1 ITEM KHỎI GIỎ
 */
const removeItem = async (cartId, itemData) => {
    // 1. Chỉ cần variantId là đủ để tìm ra item trong giỏ
    const { variantId, quantity } = itemData; 

    // Tìm item dựa trên variantId thay vì cartItemId
    const cartItem = await CartItem.findOne({ cartId, variantId });

    if (!cartItem) {
        throw new Error("Sản phẩm không có trong giỏ hàng");
    }

    // 2. Tính toán trừ số lượng
    // Lấy giá hiện tại từ Variant để đảm bảo tính đúng giá
    const variant = await Variant.findById(variantId);
    const unitPrice = variant ? Number(variant.price) : cartItem.price;

    const newQuantity = cartItem.quantity - quantity;

    if (newQuantity > 0) {
        // Nếu vẫn còn > 0 thì cập nhật
        cartItem.quantity = newQuantity;
        cartItem.price = unitPrice;
        await cartItem.save();
    } else {
        // Nếu <= 0 thì xóa luôn dòng này
        await CartItem.findOneAndDelete({ _id: cartItem._id });
    }

    // 3. Tính lại tổng tiền (Hàm này tự quét DB nên không cần client gửi price)
    await _recalculateCartTotals(cartId);

    // 4. Trả về giỏ hàng mới
    return await Cart.findById(cartId).populate({
        path: 'items',
        populate: { path: 'variantId productId' }
    });
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
        { new: true }
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
            (item) => item.variantId.toString() === guestItem.variantId.toString()
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
            const quantity = Math.min(guestItem.quantity, variant.stockQuantity);
            const newItem = await CartItem.create({
                cartId: userCart._id,
                productId: guestItem.productId,
                variantId: guestItem.variantId,
                quantity,
                price: variant.price,
            });
            
            // Push vào mảng items của User Cart
            await Cart.updateOne({ _id: userCart._id }, { $push: { items: newItem._id } });
        }
    }

    // 4. Dọn dẹp giỏ Guest
    await CartItem.deleteMany({ cartId: guestCart._id });
    await Cart.deleteOne({ _id: guestCart._id });

    // 5. Tính toán lại tổng tiền cho giỏ User sau khi merge
    await _recalculateCartTotals(userCart._id);

    return await Cart.findById(userCart._id).populate({
        path: 'items',
        populate: { path: 'variantId productId' }
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
    mergeGuestCartIntoUserCart
};