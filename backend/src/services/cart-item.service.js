const CartItemRepository = require("../repositories/cart-item.repository.js");
const CartRepository = require("../repositories/cart.repository.js");
const Variant = require("../models/variant.model.js");
const CartItem = require("../models/cart-item.model.js");

/**
 * Thêm hoặc cập nhật item trong cart (Upsert)
 */
const createCartItem = async (cartId, variantId, quantity) => {
    const variant = await Variant.findById(variantId).populate("productId");
    if (!variant) throw new Error("Variant not found");

    // GIÁ CHUẨN LÀ GIÁ VARIANT KHÔNG PHẢI PRODUCT
const unitPrice = parseFloat(variant.price.toString());

    const existingItem = await CartItem.findOne({ cartId, variantId });

    if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;

        if (newQuantity > variant.stockQuantity) {
            throw new Error(
                `Not enough stock. Only ${variant.stockQuantity} available.`,
            );
        }

        existingItem.quantity = newQuantity;
        existingItem.price = unitPrice; // luôn unitPrice

        await existingItem.save();

        // Update subtotal cart
        await CartRepository.update(cartId, {
            $inc: { totalPrice: unitPrice * quantity }, // chỉ + thêm cái mới
        });

        return existingItem;
    }

    // Nếu item chưa tồn tại
    if (quantity > variant.stockQuantity) {
        throw new Error(
            `Not enough stock. Only ${variant.stockQuantity} available.`,
        );
    }

    const newItem = await CartItemRepository.create({
        cartId,
        variantId,
        productId: variant.productId._id, // ĐÚNG
        quantity,
        price: unitPrice, // LUÔN UNIT PRICE
    });

    // Cộng subtotal vào cart
    await CartRepository.update(cartId, {
        $push: { items: newItem._id },
        $inc: { totalPrice: unitPrice * quantity },
    });

    return newItem;
};

/**
 * Cập nhật số lượng item
 */
const updateCartItem = async (cartItemId, updates) => {
    const { quantity } = updates;

    const item = await CartItem.findById(cartItemId);
    if (!item) throw new Error("CartItem not found");

    const variant = await Variant.findById(item.variantId).populate(
        "productId",
    );
    if (!variant) throw new Error("Variant not found");

const unitPrice = parseFloat(variant.price.toString());

    const differenceInQuantity = quantity - item.quantity;

    await CartItemRepository.update(cartItemId, {
        quantity,
        price: unitPrice,
    });

    // Update totalPrice bằng phần chênh lệch
    await CartRepository.update(item.cartId, {
        $inc: { totalPrice: unitPrice * differenceInQuantity },
    });

    // Return the updated item
    return await CartItem.findById(cartItemId)
        .populate("productId")
        .populate("variantId");
};
/**
 * Xoá item khỏi cart
 */
const deleteCartItem = async (cartItemId) => {
    const item = await CartItemRepository.findById(cartItemId);
    if (!item) throw new Error("CartItem not found");

    await CartItemRepository.remove(cartItemId);
    return { message: "CartItem deleted successfully" };
};

const getItemsByCartId = async (cartId) => {
    return await CartItemRepository.getAllByCartId(cartId);
};

module.exports = {
    createCartItem,
    updateCartItem,
    deleteCartItem,
    getItemsByCartId,
};
