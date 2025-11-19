// Thêm các model/repository cần thiết ở đầu file
const CartItemRepository = require("../repositories/cart-item.repository.js");
const CartRepository = require("../repositories/cart.repository.js"); // Cần để cập nhật giỏ hàng cha
const Variant = require("../models/variant.model.js"); // Cần để lấy giá + tồn kho
const CartItem = require("../models/cart-item.model.js"); // Cần cho logic tìm-hoặc-cập-nhật

/**
 * Thêm một item vào giỏ hàng (hoặc cập nhật số lượng nếu đã tồn tại).
 * Đây là logic "Upsert" (Update or Insert).
 */
const createCartItem = async (cartId, variantId, quantity) => {
    // 1. Lấy thông tin variant (giá, tồn kho)
    const variant = await Variant.findById(variantId);
    if (!variant) {
        throw new Error("Variant not found");
    }

    const unitPrice = parseFloat(variant.price.toString());

    // 2. Kiểm tra xem item này đã tồn tại trong giỏ hàng chưa
    const existingItem = await CartItem.findOne({ cartId, variantId });

    if (existingItem) {
        // 3a. NẾU ĐÃ TỒN TẠI: Cập nhật số lượng
        const newQuantity = existingItem.quantity + quantity;

        // Kiểm tra lại tồn kho
        if (newQuantity > variant.stockQuantity) {
            throw new Error(`Not enough stock. Only ${variant.stockQuantity} available.`);
        }

        existingItem.quantity = newQuantity;
        existingItem.price = unitPrice * newQuantity; // Cập nhật tổng giá của item

        // Lưu (sẽ kích hoạt hook 'save' trong model để tính lại tổng giỏ hàng)
        return await existingItem.save();
        
    } else {
        // 3b. NẾU CHƯA TỒN TẠI: Tạo mới
        // Kiểm tra tồn kho
        if (quantity > variant.stockQuantity) {
            throw new Error(`Not enough stock. Only ${variant.stockQuantity} available.`);
        }

        const itemPrice = unitPrice * quantity;
        const data = { cartId, variantId, quantity, price: itemPrice };

        // Tạo (sẽ kích hoạt hook 'save' trong model để tính lại tổng giỏ hàng)
        return await CartItemRepository.create(data);
    }
};

/**
 * Cập nhật số lượng của một item (ví dụ: đổi từ 2 thành 5)
 */
const updateCartItem = async (cartItemId, updates) => {
    const { quantity } = updates;
    if (quantity < 1) {
        // Nếu số lượng là 0 hoặc âm, hãy xóa nó
        return await deleteCartItem(cartItemId);
    }

    // 1. Lấy item và variant liên quan
    const item = await CartItem.findById(cartItemId);
    if (!item) throw new Error("CartItem not found");

    const variant = await Variant.findById(item.variantId);
    if (!variant) throw new Error("Variant not found");

    // 2. Kiểm tra tồn kho
    if (quantity > variant.stockQuantity) {
        throw new Error(`Not enough stock. Only ${variant.stockQuantity} available.`);
    }

    // 3. Tính giá mới
    const unitPrice = parseFloat(variant.price.toString());
    const newPrice = unitPrice * quantity;

    // 4. Cập nhật (sẽ kích hoạt hook 'save' để tính lại tổng giỏ hàng)
    return await CartItemRepository.update(cartItemId, {
        quantity: quantity,
        price: newPrice,
    });
};

/**
 * Xóa một item khỏi giỏ hàng
 */
const deleteCartItem = async (cartItemId) => {
    // Lấy item ra trước để lấy cartId (cần cho hook 'remove')
    const item = await CartItemRepository.findById(cartItemId);
    if (!item) throw new Error("CartItem not found");

    // Xóa (sẽ kích hoạt hook 'remove' để tính lại tổng giỏ hàng)
    await CartItemRepository.remove(cartItemId);
    return { message: "CartItem deleted successfully" };
};

/**
 * Lấy tất cả item theo cartId
 */
const getItemsByCartId = async (cartId) => {
    return await CartItemRepository.getAllByCartId(cartId);
};

module.exports = {
    createCartItem,
    updateCartItem,
    deleteCartItem,
    getItemsByCartId,
};