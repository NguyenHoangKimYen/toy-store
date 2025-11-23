const Order = require("../models/order.model");
const Product = require("../models/product.model");
const Variant = require("../models/variant.model");

module.exports = {
    // 1. TOP SELLING PRODUCTS
    async getTopSelling(limit = 10) {
        return Order.aggregate([
            { $match: { paymentStatus: "PAID" } },
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.productId",
                    quantitySold: { $sum: "$items.quantity" },
                    revenue: { $sum: "$items.subtotal" },
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
            { $unwind: "$product" },
            { $sort: { quantitySold: -1 } },
            { $limit: limit },
            {
                $project: {
                    _id: 1,
                    name: "$product.name",
                    image: "$product.thumbnail",
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
                $project: {
                    name: 1,
                    totalStock: 1,
                    thumbnail: 1,
                },
            },
            { $sort: { totalStock: 1 } },
        ]);
    },

    // 4. PRODUCT REVENUE
    async getProductRevenue() {
        return Order.aggregate([
            { $match: { paymentStatus: "PAID" } },
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.productId",
                    revenue: { $sum: "$items.subtotal" },
                    totalQuantity: { $sum: "$items.quantity" },
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
            { $unwind: "$product" },
            {
                $project: {
                    _id: 1,
                    name: "$product.name",
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
        return Order.aggregate([
            { $match: { paymentStatus: "PAID" } },
            { $unwind: "$items" },
            {
                $lookup: {
                    from: "products",
                    localField: "items.productId",
                    foreignField: "_id",
                    as: "product",
                },
            },
            { $unwind: "$product" },
            {
                $group: {
                    _id: "$product.categoryId",
                    totalSold: { $sum: "$items.quantity" },
                    revenue: { $sum: "$items.subtotal" },
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
            { $unwind: "$category" },
            {
                $project: {
                    _id: 1,
                    name: "$category.name",
                    totalSold: 1,
                    revenue: 1,
                },
            },
            { $sort: { revenue: -1 } },
        ]);
    },
};
