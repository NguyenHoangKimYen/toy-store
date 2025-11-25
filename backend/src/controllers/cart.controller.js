const CartService = require("../services/cart.service");
const socket = require("../socket/index");

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

const addItem = async (req, res, next) => {
    try {
        const cartId = req.params.cartId;
        const itemData = req.body;

        // 1. Lưu vào DB
        const updatedCart = await CartService.addItem(cartId, itemData);

        // 2. [SOCKET] Bắn tin cập nhật cho user
        // Ưu tiên lấy từ Token (req.user), nếu không có thì lấy từ Body (hỗ trợ test/guest)
        const socketUserId = (req.user && req.user._id) 
                             ? req.user._id.toString() 
                             : req.body.userId;

        if (socketUserId) {
            try {
                const io = socket.getIO();
                
                io.to(`user_${socketUserId}`).emit("cart_updated", {
                    action: "add_item",
                    totalItems: updatedCart.totalItems, 
                    cart: updatedCart,
                });
            } catch (socketErr) {
                // Vẫn nên giữ console.error để biết nếu socket bị lỗi hệ thống
                console.error("Socket emit error:", socketErr.message);
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

const removeItem = async (req, res, next) => {
    try {
        const { cartId } = req.params;
        // Body bây giờ chỉ cần variantId và quantity (giống hệt add-item)
        // userId có thể lấy từ token hoặc body để bắn socket
        const { variantId, quantity, userId } = req.body; 

        // Gọi service
        const updatedCart = await CartService.removeItem(
            cartId, 
            { variantId, quantity } // Truyền object itemData
        );

        // [SOCKET] Logic bắn tin (Giữ nguyên như cũ)
        const socketUserId = (req.user && req.user._id) ? req.user._id.toString() : userId;
        if (socketUserId) {
             // ... bắn socket emit "cart_updated"
        }

        res.status(200).json(updatedCart);
    } catch (err) {
        next(err);
    }
};

const clearCart = async (req, res, next) => {
    try {
        const updated = await CartService.clearCart(req.params.cartId);

        // [SOCKET] Bắn tin khi xóa sạch giỏ
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
    addItem,
    removeItem,
    clearCart,
    deleteCart,
};
