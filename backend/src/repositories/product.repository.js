const Product = require("../models/product.model.js");

const findAll = async (filter = {}, options = {}) => {
    const { skip = 0, limit = 20, sort = { createdAt: -1 } } = options;

    const productsQuery = Product.find(filter)
        .populate([
            {
                path: "categoryId",
                select: "name slug description",
            },
            {
                path: "variants",
                // select: "name sku price stockQuantity",
            },
        ])
        .skip(skip)
        .limit(limit)
        .sort(sort)
        .exec();

    const totalQuery = Product.countDocuments(filter).exec();

    const [products, total] = await Promise.all([productsQuery, totalQuery]);

    return { products, total };
};

const findById = async (id) => {
    return Product.findById(id).populate([
        {
            path: "categoryId",
            select: "name slug description",
        },
        {
            path: "variants",
            // select: "name sku price stockQuantity",
        },
    ]);
};

const findBySlug = async (slug) => {
    return Product.findOne({ slug }).populate([
        {
            path: "categoryId",
            select: "name slug description",
        },
        {
            path: "variants",
            // select: "name sku price stockQuantity",
        },
    ]);
};

const findByPrice = async (min, max) => {
    return Product.find({
        price: { $gte: min, $lte: max },
    });
};

/**
 * Updated: Thêm tham số options để hỗ trợ Transaction (Session)
 */
const create = async (data, options = {}) => {
    const product = new Product(data);
    // save() của mongoose hỗ trợ options { session: ... }
    return product.save(options);
};

/**
 * Updated: Thêm options
 */
const update = async (id, data, options = {}) => {
    // merge options vào tham số thứ 3
    return Product.findByIdAndUpdate(id, data, { new: true, ...options });
};

/**
 * Updated: Thêm options (để nếu sau này xóa product trong transaction cũng dùng được)
 */
const remove = async (id, options = {}) => {
    return Product.findByIdAndDelete(id, options);
};

const updatePriceRange = async (id, minPrice, maxPrice, options = {}) => {
  return await Product.findByIdAndUpdate(id, { minPrice, maxPrice }, options);
};

module.exports = {
    findAll,
    findById,
    findBySlug,
    findByPrice,
    create,
    update,
    remove,
    updatePriceRange,
};