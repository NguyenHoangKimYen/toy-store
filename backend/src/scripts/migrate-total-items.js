const mongoose = require('mongoose');
require('dotenv').config();

async function migrateTotalItems() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const Cart = mongoose.model('Cart');
        const CartItem = mongoose.model('CartItem');

        const carts = await Cart.find({});
        console.log(`\n📊 Found ${carts.length} carts to migrate`);

        let updated = 0;
        let skipped = 0;

        for (const cart of carts) {
            // Get cart items
            const items = await CartItem.find({ cartId: cart._id }).lean();
            
            // Calculate totalItems
            const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
            
            // Update cart with totalItems
            if (cart.totalItems !== totalItems) {
                await Cart.findByIdAndUpdate(cart._id, { totalItems });
                console.log(`✅ Updated cart ${cart._id}: totalItems = ${totalItems}`);
                updated++;
            } else {
                skipped++;
            }
        }

        console.log(`\n✅ Migration completed:`);
        console.log(`   - Updated: ${updated} carts`);
        console.log(`   - Skipped: ${skipped} carts (already correct)`);

        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

// Load models first
require('../models/cart.model');
require('../models/cart-item.model');

migrateTotalItems();
