const CartService = require('../services/cart.service');
const socket = require('../socket/index');

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

        // 2. [SOCKET] Emit update to user
        // Priority: Token (req.user) > Cart's userId > Body (for testing)
        let socketUserId = null;
        
        if (req.user && req.user._id) {
            socketUserId = req.user._id.toString();
        } else if (updatedCart && updatedCart.userId) {
            socketUserId = updatedCart.userId.toString();
        } else if (req.body.userId) {
            socketUserId = req.body.userId;
        }

        if (socketUserId) {
            try {
                const io = socket.getIO();
                const roomName = `user_${socketUserId}`;

                const socketData = {
                    action: 'add_item',
                    totalItems: updatedCart.totalItems,
                    cart: updatedCart,
                };
                
                io.to(roomName).emit('cart_updated', socketData);
            } catch (socketErr) {
                console.error('Socket emit error:', socketErr.message);
            }
        }

        return res.status(200).json({
            success: true,
            data: updatedCart,
        });
    } catch (error) {
        // Trả lỗi rõ ràng thay vì 500
        if (error.message === 'Variant not found') {
            return res.status(404).json({ success: false, message: 'Variant not found' });
        }
        if (error.message?.toLowerCase().includes('stock')) {
            return res.status(400).json({ success: false, message: error.message });
        }
        next(error);
    }
};

// Remove an item from the cart and notify the user via Socket.IO
const removeItem = async (req, res, next) => {
    try {
        const { cartId } = req.params;
        const { variantId, quantity } = req.body;

        // Call service - returns fully populated cart from _getPopulatedCartForSocket
        const updatedCart = await CartService.removeItem(
            cartId,
            { variantId, quantity },
        );

        // [SOCKET] Emit update to user
        // Priority: Token (req.user) > Cart's userId
        const socketUserId =
            (req.user && req.user._id) 
                ? req.user._id.toString() 
                : (updatedCart.userId ? updatedCart.userId.toString() : null);
                
        if (socketUserId) {
            try {
                const io = socket.getIO();

                const socketData = {
                    action: 'remove_item',
                    totalItems: updatedCart.totalItems,
                    cart: updatedCart,
                };
                
                io.to(`user_${socketUserId}`).emit('cart_updated', socketData);
            } catch (socketErr) {
                console.error('Socket emit error:', socketErr.message);
            }
        } else {
        }

        res.status(200).json(updatedCart);
    } catch (err) {
        next(err);
    }
};

// Clear all items from the cart and notify the user via Socket.IO
const clearCart = async (req, res, next) => {
    try {
        const updated = await CartService.clearCart(req.params.cartId);

        // [SOCKET] Emit update to user
        // Priority: Token (req.user) > Cart's userId
        const socketUserId =
            (req.user && req.user._id) 
                ? req.user._id.toString() 
                : (updated.userId ? updated.userId.toString() : null);

        if (socketUserId) {
            try {
                const io = socket.getIO();
                io.to(`user_${socketUserId}`).emit('cart_updated', {
                    action: 'clear_cart',
                    cart: updated,
                });
            } catch (e) {
                console.error('Socket emit error:', e.message);
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
