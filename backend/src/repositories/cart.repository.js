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

module.exports = {
    findCartByUserId,
    findCartBySessionId,
};
