const Category = require('../models/category.model.js');

const create = async (data) => {
    const category = new Category(data);
    return await category.save();
};

const findAll = async (options = {}) => {
    const { limit } = options;
    let query = Category.find({}).sort({ order: 1, name: 1 });
    if (limit) query = query.limit(limit);
    return await query.lean();
};

const findById = async (id) => {
    return await Category.findById(id).lean();
};

/** Tìm category theo Slug */
const findBySlug = async (slug) => {
    return await Category.findOne({ slug: slug }).lean();
};

const update = async (id, data) => {
    return await Category.findByIdAndUpdate(id, data, { new: true });
};

const remove = async (id) => {
    return await Category.findByIdAndDelete(id);
};

module.exports = {
    create,
    findAll,
    findById,
    findBySlug,
    update,
    remove,
};
