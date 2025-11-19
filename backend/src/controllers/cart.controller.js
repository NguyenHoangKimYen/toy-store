const CartService = require("../services/cart.service");

const getAllCarts = async (req, res) => {
    try {
        const carts = await CartService.getAllCarts();
        res.status(200).json(carts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getCartByUser = async (req, res) => {
    try {
        const cart = await CartService.getCartByUserOrSession({
            userId: req.params.userId,
        });
        if (!cart)
            return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });
        res.status(200).json(cart);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getCartBySession = async (req, res) => {
    try {
        const cart = await CartService.getCartByUserOrSession({
            sessionId: req.params.sessionId,
        });
        if (!cart)
            return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });
        res.status(200).json(cart);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const createCart = async (req, res) => {
    try {
        const cart = await CartService.createCart(req.body);
        res.status(201).json(cart);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const addItem = async (req, res) => {
    try {
        const { cartId } = req.params;
        const { productId, variantId, quantity, price } = req.body;

        if (!productId || !quantity || !price) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const updated = await CartService.addItem(cartId, {
            productId, variantId, quantity, price
        });

        res.status(200).json(updated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// const removeItem = async (req, res) => {
//     try {
//         const { cartId } = req.params;
//         const { cartItemId, itemPrice } = req.body;
//         const updated = await CartService.removeItem(
//             cartId,
//             cartItemId,
//             itemPrice,
//         );
//         res.status(200).json(updated);
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// };

const clearCart = async (req, res) => {
    try {
        const updated = await CartService.clearCart(req.params.cartId);
        res.status(200).json(updated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const deleteCart = async (req, res) => {
    try {
        const deleted = await CartService.deleteCart(req.params.cartId);
        if (!deleted)
            return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });
        res.status(200).json({ message: "Đã xóa giỏ hàng thành công" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getAllCarts,
    getCartByUser,
    getCartBySession,
    createCart,
    // addItem,
    // removeItem,
    clearCart,
    deleteCart,
};