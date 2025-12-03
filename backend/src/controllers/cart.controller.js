const CartService = require('../services/cart.service');

// Debug logging
const log = (...args) => console.log('[cart.controller]', ...args);

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
        log('getCartByUser called, userId:', req.params.userId);
        const cart = await CartService.getCartByUserOrSession({
            userId: req.params.userId,
        });
        log('getCartByUser result:', cart ? `cartId=${cart._id || cart.id}, items=${cart.items?.length}` : 'null');
        if (!cart)
            return res.status(404).json({ message: "Cart not found" });
        
        // Prevent browser caching cart data
        res.set({
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Surrogate-Control': 'no-store'
        });
        res.status(200).json(cart);
    } catch (err) {
        log('getCartByUser error:', err.message);
        res.status(500).json({ message: err.message });
    }
};

// Get cart by session ID
const getCartBySession = async (req, res) => {
    try {
        log('getCartBySession called, sessionId:', req.params.sessionId);
        const cart = await CartService.getCartByUserOrSession({
            sessionId: req.params.sessionId,
        });
        log('getCartBySession result:', cart ? `cartId=${cart._id || cart.id}, items=${cart.items?.length}` : 'null');
        if (!cart)
            return res.status(404).json({ message: "Cart not found" });
        
        // Prevent browser caching cart data
        res.set({
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Surrogate-Control': 'no-store'
        });
        res.status(200).json(cart);
    } catch (err) {
        log('getCartBySession error:', err.message);
        res.status(500).json({ message: err.message });
    }
};

// Create a new cart
const createCart = async (req, res) => {
    try {
        log('createCart called:', req.body);
        const cart = await CartService.createCart(req.body);
        log('createCart result:', cart?._id || cart?.id);
        res.status(201).json(cart);
    } catch (err) {
        log('createCart error:', err.message);
        res.status(500).json({ message: err.message });
    }
};

// Add an item to the cart
const addItem = async (req, res, next) => {
    try {
        const cartId = req.params.cartId;
        const itemData = req.body;
        log('addItem called:', { cartId, itemData });

        const updatedCart = await CartService.addItem(cartId, itemData);
        log('addItem result:', `items=${updatedCart.items?.length}, totalItems=${updatedCart.totalItems}`);

        // Prevent browser caching cart data
        res.set({
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });
        return res.status(200).json(updatedCart);
    } catch (error) {
        log('addItem error:', error.message);
        if (error.message === 'Variant not found') {
            return res.status(404).json({ success: false, message: 'Variant not found' });
        }
        if (error.message?.toLowerCase().includes('stock')) {
            return res.status(400).json({ success: false, message: error.message });
        }
        next(error);
    }
};

// Remove an item from the cart
const removeItem = async (req, res, next) => {
    try {
        const { cartId } = req.params;
        const { variantId, quantity } = req.body;
        log('removeItem called:', { cartId, variantId, quantity });

        const updatedCart = await CartService.removeItem(cartId, { variantId, quantity });
        log('removeItem result:', `items=${updatedCart.items?.length}, totalItems=${updatedCart.totalItems}`);

        // Prevent browser caching cart data
        res.set({
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });
        res.status(200).json(updatedCart);
    } catch (err) {
        log('removeItem error:', err.message);
        next(err);
    }
};

// Clear all items from the cart
const clearCart = async (req, res, next) => {
    try {
        log('clearCart called:', req.params.cartId);
        const updated = await CartService.clearCart(req.params.cartId);
        log('clearCart result:', updated);

        res.status(200).json(updated);
    } catch (err) {
        log('clearCart error:', err.message);
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

/**
 * Merge guest cart into user cart
 * Called after OAuth login from frontend
 */
const mergeGuestCart = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id;
        const sessionId = req.headers['x-session-id'] || req.body.sessionId;
        
        log('mergeGuestCart called:', { userId, sessionId });
        
        if (!userId) {
            return res.status(401).json({ 
                success: false, 
                message: 'User not authenticated' 
            });
        }
        
        if (!sessionId) {
            return res.status(400).json({ 
                success: false, 
                message: 'No sessionId provided' 
            });
        }
        
        const mergedCart = await CartService.mergeGuestCartIntoUserCart(userId, sessionId);
        
        log('mergeGuestCart result:', mergedCart ? 'merged' : 'no guest cart to merge');
        
        res.status(200).json({ 
            success: true, 
            message: mergedCart ? 'Cart merged successfully' : 'No guest cart to merge',
            data: mergedCart 
        });
    } catch (err) {
        log('mergeGuestCart error:', err.message);
        res.status(500).json({ 
            success: false, 
            message: err.message 
        });
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
    mergeGuestCart,
};
