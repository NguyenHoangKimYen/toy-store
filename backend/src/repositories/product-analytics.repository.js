const OrderItem = require("../models/order-item.model");
const Product = require("../models/product.model");
const Variant = require("../models/variant.model");

// Chỉ tính các đơn hợp lệ: không hủy/trả, không failed,
// paid hoặc COD đã giao/hoàn tất
const COD_METHODS = ["cashondelivery", "cod", "cashOnDelivery", "cash"];
const ACTIVE_ORDER_MATCH = {
    $and: [
        { "order.status": { $nin: ["cancelled", "returned"] } },
        { "order.paymentStatus": { $ne: "failed" } },
        {
            $or: [
                { "order.paymentStatus": "paid" },
                {
                    "order.paymentMethod": { $in: COD_METHODS },
                    "order.status": { $in: ["delivered", "completed"] },
                },
            ],
        },
    ],
};

// Lookup Order để biết trạng thái thanh toán
const withOrderLookup = [
    {
        $lookup: {
            from: "orders",
            localField: "orderId",
            foreignField: "_id",
            as: "order",
        },
    },
    { $unwind: "$order" },
    { $match: ACTIVE_ORDER_MATCH },
];

module.exports = {
    // 1. TOP SELLING PRODUCTS
    async getTopSelling(limit = 10) {
        return OrderItem.aggregate([
            ...withOrderLookup,
            {
                $group: {
                    _id: "$productId",
                    quantitySold: { $sum: "$quantity" },
                    revenue: { $sum: { $toDouble: "$subtotal" } },
                },
            },
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "product",
                },
            },
            { $unwind: '$product' },
            { $sort: { quantitySold: -1 } },
            { $limit: limit },
            {
                $project: {
                    _id: 1,
                    name: '$product.name',
                    image: { $arrayElemAt: ['$product.imageUrls', 0] },
                    quantitySold: 1,
                    revenue: 1,
                },
            },
        ]);
    },

    // 2. PRODUCTS WITH HIGH STOCK
    async getHighStock(minStock = 100) {
        return Product.aggregate([
            {
                $lookup: {
                    from: "variants",
                    localField: "variants",
                    foreignField: "_id",
                    as: "variantList",
                },
            },
            {
                $addFields: {
                    totalStock: { $sum: "$variantList.stockQuantity" },
                },
            },
            { $match: { totalStock: { $gte: minStock } } },
            {
                $project: {
                    name: 1,
                    totalStock: 1,
                    thumbnail: 1,
                },
            },
            { $sort: { totalStock: -1 } },
        ]);
    },

    // 3. PRODUCTS WITH LOW STOCK
    async getLowStock(maxStock = 10) {
        return Product.aggregate([
            {
                $lookup: {
                    from: "variants",
                    localField: "variants",
                    foreignField: "_id",
                    as: "variantList",
                },
            },
            {
                $addFields: {
                    totalStock: { $sum: "$variantList.stockQuantity" },
                },
            },
            { $match: { totalStock: { $lte: maxStock } } },
            {
                $lookup: {
                    from: "orderitems",
                    let: { productId: "$_id" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$productId", "$$productId"] } } },
                        {
                            $lookup: {
                                from: "orders",
                                localField: "orderId",
                                foreignField: "_id",
                                as: "order",
                            },
                        },
                        { $unwind: "$order" },
                        { $match: { "order.status": "Paid" } },
                        {
                            $group: {
                                _id: null,
                                totalRevenue: { $sum: { $toDouble: "$subtotal" } },
                                totalSold: { $sum: "$quantity" },
                            },
                        },
                    ],
                    as: "salesData",
                },
            },
            {
                $project: {
                    name: 1,
                    totalStock: 1,
                    image: { $arrayElemAt: ['$imageUrls', 0] },
                    price: 1,
                    soldCount: { $ifNull: [{ $arrayElemAt: ["$salesData.totalSold", 0] }, 0] },
                    revenue: { $ifNull: [{ $arrayElemAt: ["$salesData.totalRevenue", 0] }, 0] },
                },
            },
            { $sort: { totalStock: 1 } },
        ]);
    },

    // 4. PRODUCT REVENUE
    async getProductRevenue() {
        return OrderItem.aggregate([
            ...withOrderLookup,
            {
                $group: {
                    _id: "$productId",
                    revenue: { $sum: { $toDouble: "$subtotal" } },
                    totalQuantity: { $sum: "$quantity" },
                },
            },
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "product",
                },
            },
            { $unwind: '$product' },
            {
                $project: {
                    _id: 1,
                    name: '$product.name',
                    revenue: 1,
                    totalQuantity: 1,
                    thumbnail: "$product.thumbnail",
                },
            },
            { $sort: { revenue: -1 } },
        ]);
    },

    // 5. CATEGORY SALES
    async getCategoryStats() {
        return OrderItem.aggregate([
            ...withOrderLookup,
            {
                $lookup: {
                    from: "products",
                    localField: "productId",
                    foreignField: "_id",
                    as: "product",
                },
            },
            { $unwind: '$product' },
            {
                $group: {
                    _id: "$product.categoryId",
                    totalSold: { $sum: "$quantity" },
                    revenue: { $sum: { $toDouble: "$subtotal" } },
                },
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "_id",
                    foreignField: "_id",
                    as: "category",
                },
            },
            { $unwind: '$category' },
            {
                $project: {
                    _id: 1,
                    name: '$category.name',
                    totalSold: 1,
                    revenue: 1,
                },
            },
            { $sort: { revenue: -1 } },
        ]);
    },
};
