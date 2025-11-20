const Variant = require("../models/variant.model");

const findByProductId = async (productId) => {
    return await Variant.find({ productId }).lean();
};

const findById = async (id) => {
    return await Variant.findById(id);
};

/**
 * Updated: Thêm options
 */
const create = async (data, options = {}) => {
    // Variant.create([doc], { session }) hoặc new Variant(data).save({ session })
    const variant = new Variant(data);
    return variant.save(options);
};

/**
 * [NEW] Hàm tạo nhiều variants cùng lúc (Batch Insert)
 * Hỗ trợ tốt cho Transaction và hiệu năng cao hơn loop create
 */
const createMany = async (dataArray, options = {}) => {
    return await Variant.insertMany(dataArray, options);
};

/**
 * Updated: Thêm options
 */
const update = async (id, updateData, options = {}) => {
    return await Variant.findByIdAndUpdate(id, updateData, { new: true, ...options });
};

const deleteById = async (id, options = {}) => {
    return await Variant.findByIdAndDelete(id, options);
};

const deleteByProductId = async (productId, options = {}) => {
    return await Variant.deleteMany({ productId: productId }, options);
};

module.exports = {
    findByProductId,
    findById,
    create,
    createMany, // Đừng quên export hàm mới này
    update,
    deleteById,
    deleteByProductId
};