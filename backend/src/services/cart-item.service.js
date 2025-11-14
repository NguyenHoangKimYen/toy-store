const CartItemRepository = require("../repositories/cart-item.repository.js");
const Product = require("../models/product.model.js");

const createCartItem = async (cartId, productId, quantity) => {
    const product = await Product.findById(productId);
    const itemPrice = parseFloat(product.price.toString()) * quantity;

    const data = { cartId, productId, quantity, price: itemPrice };
    const item = await CartItemRepository.create(data);

    // ✅ Cập nhật giỏ hàng
    await CartService.addItem(cartId, item._id, itemPrice);

    return item;
};

const updateCartItem = async (cartItemId, updates) => {
    const oldItem = await CartItemRepository.findById(cartItemId);
    const product = await Product.findById(oldItem.productId);
    const productPrice = parseFloat(product.price.toString());

    const oldTotal = oldItem.price;
    const newTotal = productPrice * updates.quantity;

    updates.price = newTotal;

    // Cập nhật lại CartItem
    const updated = await CartItemRepository.update(cartItemId, updates);

    // Cập nhật Cart.totalPrice
    await CartService.addItem(oldItem.cartId, null, newTotal - oldTotal); // chỉ tăng/giảm chênh lệch

    return updated;
};

const deleteCartItem = async (cartItemId) => {
    const item = await CartItemRepository.findById(cartItemId);
    await CartService.removeItem(item.cartId, cartItemId, item.price);
    await CartItemRepository.remove(cartItemId);
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
