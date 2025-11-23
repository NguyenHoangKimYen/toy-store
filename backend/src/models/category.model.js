const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        description: {
            type: String,
            trim: true,
        },

        imageUrl: {
            type: String,
            default: null,
            trim: true
        }
    },
    {
        timestamps: true,
        collection: "categories",
    },
);

module.exports = mongoose.model("Category", CategorySchema);