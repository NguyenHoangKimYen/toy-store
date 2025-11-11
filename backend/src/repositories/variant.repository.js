const Variant = require("../models/variant.model");

const findByProductId = async (productId) => {
    return await Variant.find({ productId }).lean();
};

const findById = async (id) => {
    return await Variant.findById(id);
};

const create = async (data) => {
    return await Variant.create(data);
};

const update = async (id, updateData) => {
    return await Variant.findByIdAndUpdate(id, updateData, { new: true });
};

const deleteById = async (id) => {
    return await Variant.findByIdAndDelete(id);
};

const deleteByProductId = async (productId) => {
    return await Variant.deleteMany({ productId: productId });
};

module.exports = {
    findByProductId,
    findById,
    create,
    update,
    deleteById,
    deleteByProductId
};
