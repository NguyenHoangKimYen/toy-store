const mongoose = require('mongoose');
require('dotenv').config();

async function checkCart() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const CartItem = mongoose.model('CartItem');
        const Cart = mongoose.model('Cart');

        // User cart ID from logs
        const cartId = '6929f8d0006cc56657d44bdb';
        
        console.log(`\n🔍 Checking cart: ${cartId}`);
        
        const cart = await Cart.findById(cartId).lean();
        console.log('\n📊 CART:');
        console.log(`  Total Items: ${cart.totalItems}`);
        console.log(`  Items array: ${cart.items?.length || 0} refs`);
        
        const cartItems = await CartItem.find({ cartId }).lean();
        console.log(`\n📦 CART ITEMS (${cartItems.length} docs):`);
        
        for (const item of cartItems) {
            console.log(`  Variant: ${item.variantId} → Qty: ${item.quantity}`);
        }

        await mongoose.disconnect();
        console.log('\n✅ Done');
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

require('../models/cart.model');
require('../models/cart-item.model');

checkCart();
