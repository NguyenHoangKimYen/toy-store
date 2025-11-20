const CartItem = require("../models/cart-item.model");

const create = async (data) => {
    const item = new CartItem(data);
    return await item.save();
};

const withProductAndVariant = (query) => {
    return query
        .populate({ path: "productId", model: "Product" })
        .populate({ path: "variantId", model: "Variant" });
};
const findById = async (id) => {
    return await withProductAndVariant(CartItem.findById(id));
};

const update = async (id, data) => {
    return await withProductAndVariant(
        CartItem.findByIdAndUpdate(id, data, { new: true }),
    );
};

const remove = async (id) => {
    return await CartItem.findOneAndDelete({ _id: id });
};

const getAllByCartId = async (cartId) => {
    return await withProductAndVariant(CartItem.find({ cartId }));
};

module.exports = {
    create,
    findById,
    update,
    remove,
    getAllByCartId,
};
