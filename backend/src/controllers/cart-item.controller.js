const CartItemService = require("../services/cart-item.service");

const createCartItem = async (req, res) => {
    try {
        const { cartId, productId, quantity, price } = req.body;
        const item = await CartItemService.createCartItem(
            cartId,
            productId,
            quantity,
            price,
        );
        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const updateCartItem = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await CartItemService.updateCartItem(id, req.body);
        res.status(200).json(item);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const deleteCartItem = async (req, res) => {
    try {
        const { id } = req.params;
        await CartItemService.deleteCartItem(id);
        res.status(200).json({ message: "CartItem deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const getItemsByCartId = async (req, res) => {
    try {
        const { cartId } = req.params;
        const items = await CartItemService.getItemsByCartId(cartId);
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = {
    createCartItem,
    updateCartItem,
    deleteCartItem,
    getItemsByCartId,
};
