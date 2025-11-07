const Cart = require('../models/cart.model');

const findCartByUserId = async (userId) => {
    return Cart.findOne({ userId })
        .populate({
            path: 'items',
            populate: { path: 'productVariantId', populate: { path: 'productId' } }
        });
}

const findCartBySessionId = async (sessionId) => {
    return Cart.findOne({ sessionId })
        .populate({
            path: 'items',
            populate: { path: 'productVariantId', populate: { path: 'productId' } }
        });
}

const create = async (cartData) => {
    const cart = new Cart(cartData);
    return await cart.save();
}

const update = async (cartId, data) => {
    return await Cart.findByIdAndUpdate(cartId, data, { new: true }).populate('items');
}

const remove = async (cartId) => {
    return await Cart.findByIdAndDelete(cartId);
}

const getAll = async () => {
    return await Cart.find().populate('items');
}


module.exports = {
    findCartByUserId,
    findCartBySessionId,
    create,
    update,
    remove,
    getAll,
};
