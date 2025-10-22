const Product = require('../models/product.model.js');


const findAll = async (filter = {}, options = {}) => {
    return Product.find(filter)
        // .populate("brand category tags variants discountCode")
        .populate("brandId categoryId")
        .skip(options.skip || 0)
        .limit(options.limit || 20)
        .sort(options.sort || { createdAt: -1 });
}

const findById = async (id) => {
    return Product.findById(id)
        .populate("brand category tags variants discountCode");
}

const findBySlug = async (slug) => {
    return Product.findOne({ slug })
        .populate("brand category tags variants discountCode");
}

const create = async (data) => {
    const product = new Product(data);
    return product.save();
}

const update = async (id, data) => {
    return Product.findByIdAndUpdate(id, data, { new: true });
}

const remove = async (id) => {
    return Product.findByIdAndDelete(id);
}

module.exports = {
    findAll,
    findById,
    findBySlug,
    create,
    update,
    remove,
};
