/**
 * Migration script to update Cart collection indexes
 * This removes the old userId unique index and creates a new compound index
 * to support both logged-in users and multiple guest sessions
 */

const mongoose = require('mongoose');
require('dotenv').config();

async function migrateCartIndexes() {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/milkybloom';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        const db = mongoose.connection.db;
        const cartsCollection = db.collection('carts');

        // Get existing indexes
        const existingIndexes = await cartsCollection.indexes();
        console.log('\n📋 Current indexes:');
        existingIndexes.forEach(idx => {
            console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`);
        });

        // Drop old userId_1 unique index if it exists
        try {
            await cartsCollection.dropIndex('userId_1');
            console.log('\n✅ Dropped old userId_1 unique index');
        } catch (err) {
            if (err.code === 27) { // IndexNotFound error
                console.log('\n⚠️  userId_1 index not found (may have been already dropped)');
            } else {
                throw err;
            }
        }

        // Drop userId_1_sparse if it exists (from previous failed migration)
        try {
            await cartsCollection.dropIndex('userId_1_sparse');
            console.log('✅ Dropped userId_1_sparse index');
        } catch (err) {
            if (err.code === 27) {
                console.log('⚠️  userId_1_sparse index not found');
            } else {
                throw err;
            }
        }

        // Drop sessionId_1_sparse if it exists (from previous failed migration)
        try {
            await cartsCollection.dropIndex('sessionId_1_sparse');
            console.log('✅ Dropped sessionId_1_sparse index');
        } catch (err) {
            if (err.code === 27) {
                console.log('⚠️  sessionId_1_sparse index not found');
            } else {
                throw err;
            }
        }

        // Fix existing carts with null sessionId - assign them UUIDs
        const { randomUUID } = require('crypto');
        
        // First, handle carts that have neither userId nor sessionId
        const cartsWithoutBoth = await cartsCollection.find({ 
            $or: [
                { userId: null, sessionId: null },
                { userId: null, sessionId: { $exists: false } },
                { userId: { $exists: false }, sessionId: null },
                { userId: { $exists: false }, sessionId: { $exists: false } }
            ]
        }).toArray();
        
        if (cartsWithoutBoth.length > 0) {
            console.log(`\n⚠️  Found ${cartsWithoutBoth.length} carts without userId AND sessionId`);
            console.log('   Assigning unique sessionIds to guest carts...');
            
            for (const cart of cartsWithoutBoth) {
                await cartsCollection.updateOne(
                    { _id: cart._id },
                    { $set: { sessionId: randomUUID() } }
                );
            }
            console.log(`✅ Assigned sessionIds to ${cartsWithoutBoth.length} guest carts`);
        } else {
            console.log('\n✅ All carts have either userId or sessionId');
        }

        // Create new indexes
        // MongoDB doesn't support unique sparse indexes with multiple nulls reliably
        // So we only make userId unique, and handle sessionId uniqueness in application code
        await cartsCollection.createIndex(
            { userId: 1 },
            {
                name: 'userId_1_sparse',
                unique: true,
                sparse: true, // Allows multiple nulls
            }
        );
        console.log('✅ Created sparse unique index on userId');

        await cartsCollection.createIndex(
            { sessionId: 1 },
            {
                name: 'sessionId_1',
                // Not unique - allows nulls for user carts
            }
        );
        console.log('✅ Created index on sessionId (for lookups)');

        // Verify new indexes
        const newIndexes = await cartsCollection.indexes();
        console.log('\n📋 Updated indexes:');
        newIndexes.forEach(idx => {
            console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`);
        });

        // Count existing carts
        const totalCarts = await cartsCollection.countDocuments();
        const userCarts = await cartsCollection.countDocuments({ userId: { $ne: null } });
        const guestCarts = await cartsCollection.countDocuments({ userId: null, sessionId: { $ne: null } });
        const invalidCarts = await cartsCollection.countDocuments({ userId: null, sessionId: null });

        console.log('\n📊 Cart statistics:');
        console.log(`  Total carts: ${totalCarts}`);
        console.log(`  User carts: ${userCarts}`);
        console.log(`  Guest carts: ${guestCarts}`);
        console.log(`  Invalid carts (no userId or sessionId): ${invalidCarts}`);

        if (invalidCarts > 0) {
            console.log('\n⚠️  Warning: Found carts with neither userId nor sessionId');
            console.log('   These carts should be cleaned up or assigned a sessionId');
        }

        console.log('\n✅ Migration completed successfully!');

    } catch (error) {
        console.error('\n❌ Migration failed:', error);
        throw error;
    } finally {
        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
    }
}

// Run migration
if (require.main === module) {
    migrateCartIndexes()
        .then(() => {
            console.log('\n🎉 All done!');
            process.exit(0);
        })
        .catch((err) => {
            console.error('\n💥 Migration failed:', err);
            process.exit(1);
        });
}

module.exports = migrateCartIndexes;
