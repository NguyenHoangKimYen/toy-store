const Product = require('../models/product.model.js');

const findAll = async (filter = {}, options = {}) => {
    return Product.find(filter)
        .populate([
            {
                path: "categoryId",
                select: "name slug description"
            },
            {
                path: "tags",
                select: "name slug"
            }
        ])
        .skip(options.skip || 0)
        .limit(options.limit || 20)
        .sort(options.sort || { createdAt: -1 });
}

const findById = async (id) => {
    return Product.findById(id)
        .populate([
            {
                path: "categoryId",
                select: "name slug description"
            },
            {
                path: "tags",
                select: "name slug"
            }
        ])
}

const findBySlug = async (slug) => {
    return Product.findOne({ slug })
        .populate([
            {
                path: "categoryId",
                select: "name slug description"
            },
            {
                path: "tags",
                select: "name slug"
            }
        ])
}

const findByPrice = async (min, max) => {
    return Product.find({
        price: { $gte: min, $lte: max }
    });
}

const findByRating = async (minRating = 0) => {
    const rating = Number(minRating);
    if (isNaN(rating)){
        throw new Error("llll")
    }
    if (isNaN(rating) || rating < 0 || rating > 5) {
        throw new Error('The minimum rating (minRating) must be a number between 0 and 5.');
    }

    return Product.find({
        averageRating: { $gte: rating },
    }).sort({ averageRating: -1 });
};

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
    findByPrice,
    findByRating,
    create,
    update,
    remove
};
