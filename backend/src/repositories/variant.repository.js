const Variant = require('../models/variant.model');

const findByProductId = async (productId) => {
    return await Variant.find({ productId }).lean();
};

const findById = async (id) => {
    return await Variant.findById(id).lean();
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
    return await Variant.findByIdAndUpdate(id, updateData, {
        new: true,
        ...options,
    });
};

const deleteById = async (id, options = {}) => {
    return await Variant.findByIdAndDelete(id, options);
};

const deleteByProductId = async (productId, options = {}) => {
    return await Variant.deleteMany({ productId: productId }, options);
};

/**
 * Decrement stock quantity for a variant
 * Returns the updated variant or null if insufficient stock
 */
const decrementStock = async (variantId, quantity) => {
    const result = await Variant.findOneAndUpdate(
        { 
            _id: variantId, 
            stockQuantity: { $gte: quantity } // Only decrement if enough stock
        },
        { $inc: { stockQuantity: -quantity } },
        { new: true }
    );
    return result;
};

/**
 * Increment stock quantity for a variant (restore stock on cancellation)
 */
const incrementStock = async (variantId, quantity) => {
    return await Variant.findByIdAndUpdate(
        variantId,
        { $inc: { stockQuantity: quantity } },
        { new: true }
    );
};

/**
 * Bulk decrement stock for multiple variants
 * @param {Array} items - Array of { variantId, quantity }
 * @returns {Object} - { success: boolean, failedItems: Array }
 */
const bulkDecrementStock = async (items) => {
    const failedItems = [];
    
    for (const item of items) {
        const result = await decrementStock(item.variantId, item.quantity);
        if (!result) {
            failedItems.push(item);
        }
    }
    
    return {
        success: failedItems.length === 0,
        failedItems
    };
};

/**
 * Bulk increment stock for multiple variants (restore on cancellation)
 * @param {Array} items - Array of { variantId, quantity }
 */
const bulkIncrementStock = async (items) => {
    for (const item of items) {
        await incrementStock(item.variantId, item.quantity);
    }
};

module.exports = {
    findByProductId,
    findById,
    create,
    createMany, // Đừng quên export hàm mới này
    update,
    deleteById,
    deleteByProductId,
    decrementStock,
    incrementStock,
    bulkDecrementStock,
    bulkIncrementStock,
};
