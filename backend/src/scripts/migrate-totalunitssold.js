const mongoose = require('mongoose');
require('dotenv').config();

const ProductSchema = new mongoose.Schema({}, { strict: false });
const OrderSchema = new mongoose.Schema({}, { strict: false });
const OrderItemSchema = new mongoose.Schema({}, { strict: false });

const Product = mongoose.model('Product', ProductSchema);
const Order = mongoose.model('Order', OrderSchema);
const OrderItem = mongoose.model('OrderItem', OrderItemSchema);

async function migrateTotalUnitsSold() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Get all completed/delivered orders
        const completedOrders = await Order.find({
            status: { $in: ['delivered', 'completed'] }
        });
        console.log(`Found ${completedOrders.length} completed orders`);

        // Get all order items from completed orders
        const orderIds = completedOrders.map(o => o._id);
        const orderItems = await OrderItem.find({
            orderId: { $in: orderIds }
        });
        console.log(`Found ${orderItems.length} order items`);

        // Aggregate sold quantities by product
        const soldByProduct = {};
        for (const item of orderItems) {
            const productId = item.productId?.toString();
            if (productId) {
                soldByProduct[productId] = (soldByProduct[productId] || 0) + (item.quantity || 0);
            }
        }

        console.log(`\nUpdating ${Object.keys(soldByProduct).length} products...`);

        // Update each product
        let updated = 0;
        for (const [productId, totalSold] of Object.entries(soldByProduct)) {
            try {
                const result = await Product.updateOne(
                    { _id: new mongoose.Types.ObjectId(productId) },
                    { $set: { totalUnitsSold: totalSold } }
                );
                if (result.modifiedCount > 0) {
                    const product = await Product.findById(productId);
                    console.log(`Updated ${product?.name || productId}: totalUnitsSold = ${totalSold}`);
                    updated++;
                }
            } catch (err) {
                console.error(`Failed to update product ${productId}:`, err.message);
            }
        }

        // Reset products with no sales to 0
        const productsWithSales = Object.keys(soldByProduct);
        const resetResult = await Product.updateMany(
            { _id: { $nin: productsWithSales.map(id => new mongoose.Types.ObjectId(id)) } },
            { $set: { totalUnitsSold: 0 } }
        );
        console.log(`\nReset ${resetResult.modifiedCount} products with no sales to 0`);

        console.log(`\n✅ Migration complete! Updated ${updated} products with sales data.`);
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrateTotalUnitsSold();
