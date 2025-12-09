/**
 * Database URL Migration Script
 * Updates image URLs in MongoDB from .jpg/.png to .webp
 * 
 * Usage: node src/scripts/migrate-db-urls.js [--dry-run]
 * 
 * Options:
 *   --dry-run     Preview changes without modifying database
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Parse command line arguments
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');

// MongoDB connection
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

// Stats
const stats = {
    products: { checked: 0, updated: 0 },
    variants: { checked: 0, updated: 0 },
    categories: { checked: 0, updated: 0 },
    users: { checked: 0, updated: 0 },
};

/**
 * Convert URL to WebP version
 */
function toWebpUrl(url) {
    if (!url) return url;
    if (url.endsWith('.webp')) return url;
    return url.replace(/\.(jpg|jpeg|png)$/i, '.webp');
}

/**
 * Check if URL needs update
 */
function needsUpdate(url) {
    if (!url) return false;
    const ext = url.toLowerCase().split('.').pop().split('?')[0];
    return ['jpg', 'jpeg', 'png'].includes(ext);
}

/**
 * Update array of URLs
 */
function updateUrlArray(urls) {
    if (!Array.isArray(urls)) return { updated: false, urls };
    
    let hasChanges = false;
    const newUrls = urls.map(url => {
        if (needsUpdate(url)) {
            hasChanges = true;
            return toWebpUrl(url);
        }
        return url;
    });
    
    return { updated: hasChanges, urls: newUrls };
}

/**
 * Migrate Product image URLs
 */
async function migrateProducts(db) {
    console.log('\n--- Migrating Products ---');
    
    const collection = db.collection('products');
    const cursor = collection.find({});
    
    while (await cursor.hasNext()) {
        const product = await cursor.next();
        stats.products.checked++;
        
        const updates = {};
        
        // Check imageUrls array
        if (product.imageUrls) {
            const result = updateUrlArray(product.imageUrls);
            if (result.updated) {
                updates.imageUrls = result.urls;
            }
        }
        
        // Check thumbnail
        if (needsUpdate(product.thumbnail)) {
            updates.thumbnail = toWebpUrl(product.thumbnail);
        }
        
        if (Object.keys(updates).length > 0) {
            if (DRY_RUN) {
                console.log(`  [DRY-RUN] Would update product: ${product.name || product._id}`);
                console.log(`    Changes: ${JSON.stringify(updates).substring(0, 100)}...`);
            } else {
                await collection.updateOne(
                    { _id: product._id },
                    { $set: updates }
                );
                console.log(`  Updated product: ${product.name || product._id}`);
            }
            stats.products.updated++;
        }
    }
    
    console.log(`Products: ${stats.products.updated}/${stats.products.checked} updated`);
}

/**
 * Migrate Variant image URLs
 */
async function migrateVariants(db) {
    console.log('\n--- Migrating Variants ---');
    
    const collection = db.collection('variants');
    const cursor = collection.find({});
    
    while (await cursor.hasNext()) {
        const variant = await cursor.next();
        stats.variants.checked++;
        
        const updates = {};
        
        // Check images array
        if (variant.images) {
            const result = updateUrlArray(variant.images);
            if (result.updated) {
                updates.images = result.urls;
            }
        }
        
        // Check imageUrl (single)
        if (needsUpdate(variant.imageUrl)) {
            updates.imageUrl = toWebpUrl(variant.imageUrl);
        }
        
        if (Object.keys(updates).length > 0) {
            if (DRY_RUN) {
                console.log(`  [DRY-RUN] Would update variant: ${variant.sku || variant._id}`);
            } else {
                await collection.updateOne(
                    { _id: variant._id },
                    { $set: updates }
                );
            }
            stats.variants.updated++;
        }
    }
    
    console.log(`Variants: ${stats.variants.updated}/${stats.variants.checked} updated`);
}

/**
 * Migrate Category image URLs
 */
async function migrateCategories(db) {
    console.log('\n--- Migrating Categories ---');
    
    const collection = db.collection('categories');
    const cursor = collection.find({});
    
    while (await cursor.hasNext()) {
        const category = await cursor.next();
        stats.categories.checked++;
        
        const updates = {};
        
        // Check image
        if (needsUpdate(category.image)) {
            updates.image = toWebpUrl(category.image);
        }
        
        // Check backgroundImage
        if (needsUpdate(category.backgroundImage)) {
            updates.backgroundImage = toWebpUrl(category.backgroundImage);
        }
        
        if (Object.keys(updates).length > 0) {
            if (DRY_RUN) {
                console.log(`  [DRY-RUN] Would update category: ${category.name || category._id}`);
            } else {
                await collection.updateOne(
                    { _id: category._id },
                    { $set: updates }
                );
            }
            stats.categories.updated++;
        }
    }
    
    console.log(`Categories: ${stats.categories.updated}/${stats.categories.checked} updated`);
}

/**
 * Migrate User avatar URLs
 */
async function migrateUsers(db) {
    console.log('\n--- Migrating Users ---');
    
    const collection = db.collection('users');
    const cursor = collection.find({});
    
    while (await cursor.hasNext()) {
        const user = await cursor.next();
        stats.users.checked++;
        
        const updates = {};
        
        // Check avatar
        if (needsUpdate(user.avatar)) {
            updates.avatar = toWebpUrl(user.avatar);
        }
        
        if (Object.keys(updates).length > 0) {
            if (DRY_RUN) {
                console.log(`  [DRY-RUN] Would update user: ${user.email || user._id}`);
            } else {
                await collection.updateOne(
                    { _id: user._id },
                    { $set: updates }
                );
            }
            stats.users.updated++;
        }
    }
    
    console.log(`Users: ${stats.users.updated}/${stats.users.checked} updated`);
}

/**
 * Main migration function
 */
async function migrate() {
    console.log('========================================');
    console.log('Database URL Migration Script');
    console.log('========================================');
    console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no changes)' : 'LIVE'}`);
    console.log('========================================');

    if (!MONGO_URI) {
        console.error('Error: MONGODB_URI not set in environment');
        process.exit(1);
    }

    try {
        // Connect to MongoDB
        console.log('\nConnecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected successfully!');
        
        const db = mongoose.connection.db;
        
        // Run migrations
        await migrateProducts(db);
        await migrateVariants(db);
        await migrateCategories(db);
        await migrateUsers(db);
        
        // Print summary
        console.log('\n========================================');
        console.log('MIGRATION SUMMARY');
        console.log('========================================');
        console.log(`Products:   ${stats.products.updated}/${stats.products.checked} updated`);
        console.log(`Variants:   ${stats.variants.updated}/${stats.variants.checked} updated`);
        console.log(`Categories: ${stats.categories.updated}/${stats.categories.checked} updated`);
        console.log(`Users:      ${stats.users.updated}/${stats.users.checked} updated`);
        console.log('========================================');
        
        if (DRY_RUN) {
            console.log('\nThis was a DRY RUN. No changes were made.');
            console.log('Run without --dry-run to apply changes.');
        } else {
            console.log('\nDatabase migration complete!');
        }
        
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
}

// Run migration
migrate();
