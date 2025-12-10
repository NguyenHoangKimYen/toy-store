const Product = require('../models/product.model.js');

const findAll = async (filter = {}, options = {}) => {
    const { skip = 0, limit = 20, sort = { createdAt: -1 } } = options;

    const productsQuery = Product.find(filter)
        .populate([
            {
                path: 'categoryId',
                select: 'name slug description',
            },
            {
                path: 'variants',
                select: 'sku price salePrice size color attributes stockQuantity imageUrls productId',
            },
        ])
        .skip(skip)
        .limit(limit)
        .sort(sort)
        .lean()
        .exec();

    const totalQuery = Product.countDocuments(filter).lean().exec();

    const [products, total] = await Promise.all([productsQuery, totalQuery]);

    return { products, total };
};

const findById = async (id) => {
    return Product.findById(id)
        .populate([
            {
                path: 'categoryId',
                select: 'name slug description',
            },
            {
                path: 'variants',
            },
        ])
        .lean();
};

const findBySlug = async (slug) => {
    return Product.findOne({ slug })
        .populate([
            {
                path: 'categoryId',
                select: 'name slug description',
            },
            {
                path: 'variants',
            },
        ])
        .lean();
};

const findByPrice = async (min, max) => {
    return Product.find({
        price: { $gte: min, $lte: max },
    }).lean();
};

const create = async (data, options = {}) => {
    const product = new Product(data);
    return product.save(options);
};

const update = async (id, data, options = {}) => {
    return Product.findByIdAndUpdate(id, data, { new: true, ...options });
};

const remove = async (id, options = {}) => {
    return Product.findByIdAndDelete(id, options);
};

const updatePriceRange = async (id, minPrice, maxPrice, options = {}) => {
    return await Product.findByIdAndUpdate(id, { minPrice, maxPrice }, options);
};

/**
 * Get aggregated stats for all products
 */
const getStats = async (filter = {}) => {
    const Variant = require('./variant.repository');
    
    // Get total products count
    const totalProducts = await Product.countDocuments(filter);
    
    // Aggregate stats
    const stats = await Product.aggregate([
        { $match: filter },
        {
            $lookup: {
                from: 'variants',
                localField: '_id',
                foreignField: 'productId',
                as: 'variants'
            }
        },
        {
            $group: {
                _id: null,
                totalStock: { $sum: { $sum: '$variants.stockQuantity' } },
                totalSold: { $sum: '$totalUnitsSold' },
                outOfStock: {
                    $sum: {
                        $cond: [
                            { $eq: [{ $sum: '$variants.stockQuantity' }, 0] },
                            1,
                            0
                        ]
                    }
                }
            }
        }
    ]);
    
    return {
        totalProducts,
        totalStock: stats[0]?.totalStock || 0,
        totalSold: stats[0]?.totalSold || 0,
        outOfStock: stats[0]?.outOfStock || 0,
    };
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
    getStats,
};
