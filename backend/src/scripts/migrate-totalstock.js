const mongoose = require("mongoose");
require("dotenv").config();

const ProductSchema = new mongoose.Schema({}, { strict: false });
const VariantSchema = new mongoose.Schema({}, { strict: false });

const Product = mongoose.model("Product", ProductSchema);
const Variant = mongoose.model("Variant", VariantSchema);

async function migrateTotalStock() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const products = await Product.find({});
        console.log(`Found ${products.length} products to update`);

        let updated = 0;
        for (const product of products) {
            const variants = await Variant.find({ 
                productId: product._id, 
                isActive: true 
            });

            const totalStock = variants.reduce((sum, v) => sum + (v.stockQuantity || 0), 0);
            
            await Product.updateOne(
                { _id: product._id },
                { $set: { totalStock: totalStock } }
            );

            console.log(`Updated ${product.name}: totalStock = ${totalStock}`);
            updated++;
        }

        console.log(`\n✅ Migration complete! Updated ${updated} products.`);
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
}

migrateTotalStock();
