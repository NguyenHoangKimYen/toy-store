const Category = require("../models/category.model.js");

const create = async (data) => {
    const category = new Category(data);
    return await category.save();
};

const findAll = async () => {
    return await Category.find({});
};

const findById = async (id) => {
    return await Category.findById(id);
};

/** Tìm category theo Slug */
const findBySlug = async (slug) => {
    return await Category.findOne({ slug: slug });
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