/**
 * Script to fix duplicate carts issue
 * 
 * Problems found:
 * 1. sessionId doesn't have a unique index - multiple carts can exist for same session
 * 2. This causes random cart switching (showing old vs new cart)
 * 
 * This script will:
 * 1. Find all duplicate carts (same userId or sessionId)
 * 2. Merge items from duplicate carts into the newest one
 * 3. Delete the old duplicate carts
 * 4. Add unique index on sessionId
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const Cart = require('../models/cart.model');
const CartItem = require('../models/cart-item.model');

async function findDuplicateCarts() {
    console.log('\n=== Finding Duplicate Carts ===\n');
    
    // Find duplicate sessionId carts
    const duplicateSessions = await Cart.aggregate([
        { $match: { sessionId: { $ne: null, $exists: true } } },
        { $group: { _id: '$sessionId', count: { $sum: 1 }, carts: { $push: '$$ROOT' } } },
        { $match: { count: { $gt: 1 } } }
    ]);
    
    console.log(`Found ${duplicateSessions.length} sessionIds with duplicate carts`);
    
    // Find duplicate userId carts (shouldn't happen due to unique index, but check anyway)
    const duplicateUsers = await Cart.aggregate([
        { $match: { userId: { $ne: null, $exists: true } } },
        { $group: { _id: '$userId', count: { $sum: 1 }, carts: { $push: '$$ROOT' } } },
        { $match: { count: { $gt: 1 } } }
    ]);
    
    console.log(`Found ${duplicateUsers.length} userIds with duplicate carts`);
    
    return { duplicateSessions, duplicateUsers };
}

async function mergeDuplicateCarts(duplicates, type) {
    console.log(`\n=== Merging ${type} Duplicate Carts ===\n`);
    
    let mergedCount = 0;
    let deletedCartsCount = 0;
    let movedItemsCount = 0;
    
    for (const dup of duplicates) {
        const identifier = type === 'session' ? dup._id : dup._id?.toString();
        console.log(`\nProcessing ${type}: ${identifier} (${dup.count} carts)`);
        
        // Sort carts by updatedAt desc to keep the most recently updated one
        const sortedCarts = dup.carts.sort((a, b) => 
            new Date(b.updatedAt) - new Date(a.updatedAt)
        );
        
        const primaryCart = sortedCarts[0];
        const duplicateCarts = sortedCarts.slice(1);
        
        console.log(`  Primary cart: ${primaryCart._id} (updated: ${primaryCart.updatedAt})`);
        console.log(`  Duplicate carts to merge: ${duplicateCarts.length}`);
        
        // Move items from duplicate carts to primary cart
        for (const dupCart of duplicateCarts) {
            const items = await CartItem.find({ cartId: dupCart._id });
            console.log(`    Cart ${dupCart._id}: ${items.length} items`);
            
            for (const item of items) {
                // Check if item already exists in primary cart
                const existingItem = await CartItem.findOne({
                    cartId: primaryCart._id,
                    variantId: item.variantId
                });
                
                if (existingItem) {
                    // Merge quantities
                    existingItem.quantity += item.quantity;
                    await existingItem.save();
                    console.log(`      Merged variantId ${item.variantId}: +${item.quantity}`);
                } else {
                    // Move item to primary cart
                    item.cartId = primaryCart._id;
                    await item.save();
                    console.log(`      Moved variantId ${item.variantId} to primary cart`);
                }
                movedItemsCount++;
            }
            
            // Delete duplicate cart
            await Cart.findByIdAndDelete(dupCart._id);
            deletedCartsCount++;
            console.log(`    Deleted duplicate cart ${dupCart._id}`);
        }
        
        // Recalculate primary cart totals
        await recalculateCartTotals(primaryCart._id);
        mergedCount++;
    }
    
    return { mergedCount, deletedCartsCount, movedItemsCount };
}

async function recalculateCartTotals(cartId) {
    const items = await CartItem.find({ cartId });
    let totalPrice = 0;
    let totalItems = 0;

    items.forEach((item) => {
        const price = parseFloat(item.price?.toString() || '0');
        totalPrice += price * item.quantity;
        totalItems += item.quantity;
    });

    await Cart.findByIdAndUpdate(cartId, {
        items: items.map((item) => item._id),
        totalPrice,
        totalItems,
    });
    
    console.log(`    Recalculated cart ${cartId}: ${totalItems} items, $${totalPrice.toFixed(2)}`);
}

async function addUniqueSessionIndex() {
    console.log('\n=== Adding Unique Index on sessionId ===\n');
    
    try {
        // Drop existing non-unique index if exists
        try {
            await Cart.collection.dropIndex('sessionId_1');
            console.log('Dropped existing sessionId index');
        } catch (e) {
            // Index might not exist, that's fine
        }
        
        // Create sparse unique index on sessionId
        // sparse: true means null/undefined values are ignored (for user carts that don't have sessionId)
        await Cart.collection.createIndex(
            { sessionId: 1 },
            { 
                unique: true, 
                sparse: true,
                name: 'sessionId_unique_sparse'
            }
        );
        console.log('Created unique sparse index on sessionId');
        
        return true;
    } catch (error) {
        console.error('Failed to create index:', error.message);
        return false;
    }
}

async function showCartStats() {
    console.log('\n=== Cart Statistics ===\n');
    
    const totalCarts = await Cart.countDocuments();
    const userCarts = await Cart.countDocuments({ userId: { $ne: null } });
    const sessionCarts = await Cart.countDocuments({ sessionId: { $ne: null }, userId: null });
    const totalItems = await CartItem.countDocuments();
    
    console.log(`Total carts: ${totalCarts}`);
    console.log(`  User carts: ${userCarts}`);
    console.log(`  Session carts: ${sessionCarts}`);
    console.log(`Total cart items: ${totalItems}`);
    
    // Check for orphaned items
    const cartIds = (await Cart.find({}, '_id').lean()).map(c => c._id);
    const orphanedItems = await CartItem.countDocuments({
        cartId: { $nin: cartIds }
    });
    console.log(`Orphaned items (no parent cart): ${orphanedItems}`);
}

async function main() {
    try {
        await connectDB();
        console.log('Connected to MongoDB');
        
        // Show initial stats
        await showCartStats();
        
        // Find duplicates
        const { duplicateSessions, duplicateUsers } = await findDuplicateCarts();
        
        if (duplicateSessions.length === 0 && duplicateUsers.length === 0) {
            console.log('\n✅ No duplicate carts found!');
        } else {
            // Merge duplicates
            if (duplicateSessions.length > 0) {
                const sessionStats = await mergeDuplicateCarts(duplicateSessions, 'session');
                console.log(`\nSession merge results:`);
                console.log(`  Merged: ${sessionStats.mergedCount} groups`);
                console.log(`  Deleted: ${sessionStats.deletedCartsCount} duplicate carts`);
                console.log(`  Moved/merged: ${sessionStats.movedItemsCount} items`);
            }
            
            if (duplicateUsers.length > 0) {
                const userStats = await mergeDuplicateCarts(duplicateUsers, 'user');
                console.log(`\nUser merge results:`);
                console.log(`  Merged: ${userStats.mergedCount} groups`);
                console.log(`  Deleted: ${userStats.deletedCartsCount} duplicate carts`);
                console.log(`  Moved/merged: ${userStats.movedItemsCount} items`);
            }
        }
        
        // Add unique index to prevent future duplicates
        await addUniqueSessionIndex();
        
        // Show final stats
        await showCartStats();
        
        console.log('\n✅ Done!');
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

main();
