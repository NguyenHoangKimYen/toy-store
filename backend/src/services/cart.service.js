const CartRepository = require("../repositories/cart.repository");
const Cart = require("../models/cart.model");
const CartItem = require("../models/cart-item.model");
const Variant = require("../models/variant.model");
const getCartByUserOrSession = async ({ userId, sessionId }) => {
    if (userId) {
        return await CartRepository.findCartByUserId(userId);
    }
    return await CartRepository.findCartBySessionId(sessionId);
};

const getOrCreateCart = async (userId, sessionId) => {
    if (userId) {
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = await Cart.create({
                userId,
                items: [],
                totalPrice: 0,
            });
        }
        return cart;
    }

    if (sessionId) {
        let cart = await Cart.findOne({ sessionId });
        if (!cart) {
            cart = await Cart.create({
                sessionId,
                items: [],
                totalPrice: 0,
            });
        }
        return cart;
    }

    throw new Error("Either userId or sessionId must be provided");
};

// Tạo giỏ hàng mới nếu chưa tồn tại
const createCart = async ({ userId, sessionId }) => {
    console.log("🔍 createCart called with:", { userId, sessionId });

    const existing = await getCartByUserOrSession({ userId, sessionId });
    if (existing) {
        console.log("✅ Existing cart found:", existing._id);
        return existing;
    }

    // Only include userId or sessionId, never both as null
    const newCart = {
        items: [],
        totalPrice: 0,
    };

    if (userId) {
        console.log("👤 Creating user cart with userId:", userId);
        newCart.userId = userId;
    } else if (sessionId) {
        console.log("👻 Creating guest cart with sessionId:", sessionId);
        newCart.sessionId = sessionId;
    } else {
        console.error("❌ Neither userId nor sessionId provided!");
        throw new Error("Either userId or sessionId must be provided");
    }

    console.log("📦 Cart object to create:", newCart);
    const result = await CartRepository.create(newCart);
    console.log("✅ Cart created successfully:", result._id);
    return result;
};

const addItem = async (cartId, itemData) => {
    const { variantId, quantity } = itemData;

    const variant = await Variant.findById(variantId);
    if (!variant) throw new Error("Variant not found");

    const productId = variant.productId;
    const unitPrice = Number(variant.price);

    const cartItem = await CartItem.create({
        cartId,
        productId,
        variantId,
        quantity,
        price: unitPrice,
    });

    // Recalc tổng giỏ hàng (CartItem.post('save') đã tự chạy)
    return await Cart.findById(cartId).populate("items");
};

const removeItem = async (cartId, cartItemId) => {
    await CartItem.findOneAndDelete({ _id: cartItemId });
    return await Cart.findById(cartId).populate("items");
};

const clearCart = async (cartId) => {
    await CartItem.deleteMany({ cartId });
    return await Cart.findByIdAndUpdate(
        cartId,
        { items: [], totalPrice: 0 },
        { new: true },
    );
};

// Xóa giỏ hàng (phía admin)
const deleteCart = async (cartId) => {
    return await CartRepository.delete(cartId);
};

// Lấy tất cả giỏ hàng (phía admin)
const getAllCarts = async () => {
    return await CartRepository.getAll();
};

// Merge guest cart into user cart when user logs in
const mergeGuestCartIntoUserCart = async (userId, sessionId) => {
    try {
        console.log(
            "🔀 Starting cart merge - userId:",
            userId,
            "sessionId:",
            sessionId,
        );

        if (!sessionId) {
            console.log("⚠️ No sessionId provided, skipping merge");
            return null;
        }

        // Find guest cart by sessionId
        const guestCart = await Cart.findOne({ sessionId });
        console.log("🔍 Guest cart found:", guestCart ? guestCart._id : "none");

        if (!guestCart) {
            console.log("⚠️ No guest cart found, skipping merge");
            return null;
        }

        // Get guest cart items
        const guestCartItems = await CartItem.find({ cartId: guestCart._id });
        console.log("📋 Guest cart has", guestCartItems.length, "items");

        if (guestCartItems.length === 0) {
            console.log("⚠️ Guest cart is empty, deleting and skipping merge");
            await Cart.deleteOne({ _id: guestCart._id });
            return null;
        }

        // Get or create user cart
        let userCart = await Cart.findOne({ userId });
        if (!userCart) {
            console.log("📦 Creating new user cart for userId:", userId);
            userCart = await Cart.create({
                userId,
                items: [],
                totalPrice: 0,
            });
        } else {
            console.log("✅ Found existing user cart:", userCart._id);
        }

        // Get user's existing cart items
        const userCartItems = await CartItem.find({ cartId: userCart._id });
        console.log(
            "📋 User cart has",
            userCartItems.length,
            "items before merge",
        );

        // Merge items: if same variantId exists, sum quantities; otherwise add new item
        let mergedCount = 0;
        let addedCount = 0;

        for (const guestItem of guestCartItems) {
            // Validate variant still exists and has stock
            const variant = await Variant.findById(guestItem.variantId);
            if (!variant || variant.stockQuantity <= 0) {
                console.log(
                    "⚠️ Skipping item - variant not found or out of stock:",
                    guestItem.variantId,
                );
                continue;
            }

            const existingUserItem = userCartItems.find(
                (item) =>
                    item.variantId.toString() ===
                    guestItem.variantId.toString(),
            );

            if (existingUserItem) {
                // Merge: Add guest quantity to existing user item
                const newQuantity =
                    existingUserItem.quantity + guestItem.quantity;
                const maxQuantity = Math.min(
                    newQuantity,
                    variant.stockQuantity,
                );

                console.log(
                    `➕ Merging item: ${existingUserItem.quantity} + ${guestItem.quantity} = ${maxQuantity} (stock: ${variant.stockQuantity})`,
                );

                existingUserItem.quantity = maxQuantity;
                existingUserItem.price = variant.price; // Update to latest price
                await existingUserItem.save();
                mergedCount++;
            } else {
                // Add new item from guest cart to user cart
                const quantity = Math.min(
                    guestItem.quantity,
                    variant.stockQuantity,
                );

                console.log(
                    `➕ Adding new item to user cart: quantity=${quantity}`,
                );

                await CartItem.create({
                    cartId: userCart._id,
                    productId: guestItem.productId,
                    variantId: guestItem.variantId,
                    quantity,
                    price: variant.price, // Use latest price
                });
                addedCount++;
            }
        }

        // Delete guest cart and its items
        console.log("🗑️ Deleting guest cart and its items");
        await CartItem.deleteMany({ cartId: guestCart._id });
        await Cart.deleteOne({ _id: guestCart._id });

        console.log(
            `✅ Cart merge completed: ${mergedCount} merged, ${addedCount} added`,
        );

        // Return updated user cart
        return await Cart.findById(userCart._id);
    } catch (error) {
        console.error("Error merging guest cart into user cart:", error);
        throw error;
    }
};

module.exports = {
    getCartByUserOrSession,
    getOrCreateCart,
    createCart,
    addItem,
    removeItem,
    clearCart,
    deleteCart,
    getAllCarts,
    mergeGuestCartIntoUserCart,
};
