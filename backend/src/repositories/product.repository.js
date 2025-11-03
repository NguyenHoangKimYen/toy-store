const Product = require('../models/product.model.js');

// Trong file product.repository.js

const findAll = async (filter = {}, options = {}) => {
    // Tách các options ra
    const { skip = 0, limit = 20, sort = { createdAt: -1 } } = options;

    // Định nghĩa 2 truy vấn
    // 1. Truy vấn lấy sản phẩm CÓ populate, sort, skip, limit
    const productsQuery = Product.find(filter)
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
        .skip(skip)
        .limit(limit)
        .sort(sort)
        .exec(); // Thêm .exec() để chuẩn bị cho Promise

    // 2. Truy vấn đếm tổng số sản phẩm CHỈ CÓ filter
    const totalQuery = Product.countDocuments(filter).exec();

    // Chạy cả 2 truy vấn song song
    const [products, total] = await Promise.all([
        productsQuery,
        totalQuery
    ]);

    // Trả về object chứa cả hai kết quả
    return { products, total };
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
    if (isNaN(rating)) {
        throw new Error("Giá trị minRating phải là một con số hợp lệ.")
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
