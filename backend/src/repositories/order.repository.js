const Order = require("../models/order.model");

const create = async (data) => {
    const order = new Order(data);
    return await order.save();
};

const findById = async (id) => {
    return await Order.findById(id)
        .populate("userId")
        .populate("addressId")
        .populate("discountCodeId");
};

const findAllByUserId = async (userId) => {
    return await Order.find({ userId })
        .populate("addressId")
        .populate("discountCodeId");
};

const update = async (id, data) => {
    return await Order.findByIdAndUpdate(id, data, { new: true });
};

const remove = async (id) => {
    return await Order.findByIdAndDelete(id);
};

const getAll = async () => {
    return await Order.find()
        .populate("userId")
        .populate("addressId")
        .populate("discountCodeId");
};

module.exports = {
    create,
    findById,
    findAllByUserId,
    update,
    remove,
    getAll,
};
