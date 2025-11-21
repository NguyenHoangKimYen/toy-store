const mongoose = require("mongoose");
const Product = mongoose.model("Product");

const VariantSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
            index: true,
        },

        sku: {
            type: String,
            unique: true,
            trim: true,
        },

        attributes: [
            {
                name: { type: String, required: true },
                value: { type: String, required: true },
            },
        ],

        weight: {
            type: Number,
            default: 100,
            min: 0,
        },

        price: {
            type: mongoose.Schema.Types.Decimal128,
            min: 0,
            default: 0
        },

        stockQuantity: {
            type: Number,
            default: 0,
            min: 0,
        },

        imageUrls: [
            {
                type: String,
                trim: true,
            },
        ],

        unitsSold: {
            type: Number,
            default: 0,
            min: 0,
            index: true
        },

        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
    },
    {
        timestamps: true,
        collection: "variants",
    },
);

// Hàm tìm và cập nhật giá MIN/MAX và totalStock cho sản phẩm cha
async function updateProductPrices(productId) {
    if (!productId) return;

    const activeVariants = await mongoose.model("Variant").find({ productId: productId, isActive: true });

    let minPrice = 0;
    let maxPrice = 0;
    let totalStock = 0;

    if (activeVariants.length > 0) {
        const prices = activeVariants.map(v => parseFloat(v.price.toString()));

        minPrice = Math.min(...prices);
        maxPrice = Math.max(...prices);
        totalStock = activeVariants.reduce((sum, v) => sum + (v.stockQuantity || 0), 0);
    }
    
    await mongoose.model("Product").updateOne(
        { _id: productId },
        { $set: { minPrice: minPrice, maxPrice: maxPrice, totalStock: totalStock } }
    );
    console.log(`Updated min/max price and totalStock for Product ${productId}: ${minPrice} - ${maxPrice}, Stock: ${totalStock}`);
}

// Static method to manually recalculate product data (for bulk operations)
VariantSchema.statics.recalculateProductData = async function(productId) {
    await updateProductPrices(productId);
};

// 3. Đăng ký Middleware (Sau khi Variant được lưu, cập nhật, hoặc xóa)
VariantSchema.post('save', function() {
    updateProductPrices(this.productId);
});

VariantSchema.post('remove', function() {
    updateProductPrices(this.productId);
});

VariantSchema.post('findOneAndDelete', function(doc) {
    if (doc) {
        updateProductPrices(doc.productId);
    }
});

VariantSchema.post('findOneAndUpdate', function(doc) {
    if (doc) {
        updateProductPrices(doc.productId);
    }
});

module.exports = mongoose.model("Variant", VariantSchema);