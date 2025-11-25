const mongoose = require("mongoose");

require("./category.model.js");

const ProductSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        categoryId: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Category",
                required: true,
                index: true,
            },
        ],

        description: {
            type: String,
            required: true,
        },

        attributes: [
            {
                name: { type: String, required: true },
                values: [{ type: String, required: true }],
            },
        ],

        minPrice: { type: Number, default: 0 },
        maxPrice: { type: Number, default: 0 },

        totalStock: {
            type: Number,
            default: 0,
            min: 0,
            index: true,
        },

        imageUrls: [
            {
                type: String,
                trim: true,
            },
        ],

        averageRating: {
            type: Number,
            default: 0.0,
            min: 0,
            max: 5,
        },

        variants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Variant",
            },
        ],

        status: {
            type: String,
            enum: ["Draft", "Published", "Archived", "Disabled"],
            default: "Draft",
            index: true,
        },

        isFeatured: {
            type: Boolean,
            default: false,
            index: true,
        },

        totalUnitsSold: {
            type: Number,
            default: 0,
            min: 0,
            index: true,
        },
    },
    {
        timestamps: true,
        collection: "products",
    },
);

module.exports = mongoose.model("Product", ProductSchema);
