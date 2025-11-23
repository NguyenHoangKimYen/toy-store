const CartItemService = require("../services/cart-item.service");

const createCartItem = async (req, res, next) => {
    // Thêm next
    try {
        // [SỬA] Đổi productId thành variantId
        const { cartId, variantId, quantity } = req.body;

        const item = await CartItemService.createCartItem(
            cartId,
            variantId, // [SỬA]
            quantity,
        );
        res.status(201).json(item);
    } catch (error) {
        next(error); // [SỬA] Dùng next(error)
    }
};

const updateCartItem = async (req, res, next) => {
    // Thêm next
    try {
        const { id } = req.params;
        // Chỉ cho phép cập nhật quantity
        const { quantity } = req.body;

        const item = await CartItemService.updateCartItem(id, { quantity });
        res.status(200).json(item);
    } catch (error) {
        next(error); // [SỬA]
    }
};

const deleteCartItem = async (req, res, next) => {
    // Thêm next
    try {
        const { id } = req.params;
        await CartItemService.deleteCartItem(id);
        res.status(200).json({ message: "CartItem deleted successfully" });
    } catch (error) {
        next(error); // [SỬA]
    }
};

const getItemsByCartId = async (req, res, next) => {
    // Thêm next
    try {
        const { cartId } = req.params;
        const items = await CartItemService.getItemsByCartId(cartId);
        res.status(200).json(items);
    } catch (error) {
        next(error); // [SỬA]
    }
};

module.exports = {
    createCartItem,
    updateCartItem,
    deleteCartItem,
    getItemsByCartId,
};
