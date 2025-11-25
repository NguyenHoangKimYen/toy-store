const CartService = require("../services/cart.service");
const socket = require("../socket/index");

// Get all carts
const getAllCarts = async (req, res) => {
    try {
        const carts = await CartService.getAllCarts();
        res.status(200).json(carts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get cart by user ID
const getCartByUser = async (req, res) => {
    try {
        const cart = await CartService.getCartByUserOrSession({
            userId: req.params.userId,
        });
        if (!cart)
            return res.status(404).json({ message: "Cart not found" });
        res.status(200).json(cart);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get cart by session ID
const getCartBySession = async (req, res) => {
    try {
        const cart = await CartService.getCartByUserOrSession({
            sessionId: req.params.sessionId,
        });
        if (!cart)
            return res.status(404).json({ message: "Cart not found" });
        res.status(200).json(cart);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Create a new cart
const createCart = async (req, res) => {
    try {
        const cart = await CartService.createCart(req.body);
        res.status(201).json(cart);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Add an item to the cart and notify the user via Socket.IO
const addItem = async (req, res, next) => {
    try {
        const cartId = req.params.cartId;
        const itemData = req.body;

        // 1. Save to DB
        const updatedCart = await CartService.addItem(cartId, itemData);

        // 2. [SOCKET] Emit update to the user's room
        if (req.user && req.user._id) {
            try {
                const io = socket.getIO();
                const userId = req.user._id.toString();

                console.log(
                    `🔌 Emitting 'cart_updated' to room: user_${userId}`,
                );

                io.to(`user_${userId}`).emit("cart_updated", {
                    action: "add_item",
                    totalItems: updatedCart.totalItems, // Assuming service returns this field
                    cart: updatedCart,
                });
            } catch (socketErr) {
                console.error("Socket emit error:", socketErr.message);
                // Do not throw error to avoid disrupting the main flow
            }
        }

        return res.status(200).json({
            success: true,
            data: updatedCart,
        });
    } catch (error) {
        next(error);
    }
};

// Remove an item from the cart and notify the user via Socket.IO
const removeItem = async (req, res, next) => {
    try {
        const { cartId } = req.params;
        const { cartItemId, itemPrice } = req.body;

        const updated = await CartService.removeItem(
            cartId,
            cartItemId,
            itemPrice,
        );

        // [SOCKET] Also emit a message when removing to sync
        if (req.user && req.user._id) {
            try {
                const io = socket.getIO();
                io.to(`user_${req.user._id}`).emit("cart_updated", {
                    action: "remove_item",
                    cart: updated,
                });
            } catch (e) {
                console.error(e);
            }
        }

        res.status(200).json(updated);
    } catch (err) {
        next(err);
    }
};

// Clear all items from the cart and notify the user via Socket.IO
const clearCart = async (req, res, next) => {
    try {
        const updated = await CartService.clearCart(req.params.cartId);

        // [SOCKET] Emit a message when clearing the entire cart
        if (req.user && req.user._id) {
            try {
                const io = socket.getIO();
                io.to(`user_${req.user._id}`).emit("cart_updated", {
                    action: "clear_cart",
                    cart: updated,
                });
            } catch (e) {
                console.error(e);
            }
        }

        res.status(200).json(updated);
    } catch (err) {
        next(err);
    }
};

// Delete the cart entirely
const deleteCart = async (req, res) => {
    try {
        const deleted = await CartService.deleteCart(req.params.cartId);
        if (!deleted)
            return res.status(404).json({ message: "Cart not found" });
        res.status(200).json({ message: "Cart deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getAllCarts,
    getCartByUser,
    getCartBySession,
    createCart,
    addItem,
    removeItem,
    clearCart,
    deleteCart,
};
