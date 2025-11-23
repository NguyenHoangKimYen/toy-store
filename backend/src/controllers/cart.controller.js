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

        // 2. [SOCKET] Bắn tin cập nhật cho user này
        // Kiểm tra xem user có đăng nhập không (có req.user) để gửi đúng room
        if (req.user && req.user._id) {
            try {
                const io = socket.getIO();
                const userId = req.user._id.toString();

                console.log(
                    `🔌 Emitting 'cart_updated' to room: user_${userId}`,
                );

                io.to(`user_${userId}`).emit("cart_updated", {
                    action: "add_item",
                    totalItems: updatedCart.totalItems, // Giả sử service trả về field này
                    cart: updatedCart,
                });
            } catch (socketErr) {
                console.error("Socket emit error:", socketErr.message);
                // Không throw error để tránh làm hỏng luồng mua hàng chính
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
    // Nhớ thêm next để bắt lỗi chuẩn
    try {
        const { cartId } = req.params;
        const { cartItemId, itemPrice } = req.body;

        const updated = await CartService.removeItem(
            cartId,
            cartItemId,
            itemPrice,
        );

        // [SOCKET] Cũng nên bắn tin khi xóa để đồng bộ
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
        // res.status(500).json({ message: err.message }); -> Nên dùng next(err) cho đồng bộ
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
