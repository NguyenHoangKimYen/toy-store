const CartItem = require("../models/cart-item.model");

const create = async (data) => {
    const item = new CartItem(data);
    return await item.save();
};

const findById = async (id) => {
    return await CartItem.findById(id).populate("productId");
};

const update = async (id, data) => {
    return await CartItem.findByIdAndUpdate(id, data, { new: true }).populate(
        "productId",
    );
};

const remove = async (id) => {
    return await CartItem.findOneAndDelete({ _id: id });
};

const getAllByCartId = async (cartId) => {
    return await CartItem.find({ cartId }).populate("productId");
};

module.exports = {
    create,
    findById,
    update,
    remove,
    getAllByCartId,
};
