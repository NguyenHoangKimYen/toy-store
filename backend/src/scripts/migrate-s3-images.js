/**
 * S3 Image Migration Script
 * Converts existing JPEG/PNG images to optimized WebP format
 * 
 * Usage: node src/scripts/migrate-s3-images.js [--dry-run] [--folder=productImages]
 * 
 * Options:
 *   --dry-run     Preview changes without modifying anything
 *   --folder=X    Only process specific folder (productImages, categoryImages, etc.)
 *   --limit=N     Limit number of images to process (for testing)
 */

require('dotenv').config();
const AWS = require('aws-sdk');
const sharp = require('sharp');

// Configure AWS
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'ap-southeast-2',
});

const BUCKET = process.env.AWS_BUCKET_NAME;

// Parse command line arguments
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const FOLDER_ARG = args.find(a => a.startsWith('--folder='));
const LIMIT_ARG = args.find(a => a.startsWith('--limit='));
const TARGET_FOLDER = FOLDER_ARG ? FOLDER_ARG.split('=')[1] : null;
const LIMIT = LIMIT_ARG ? parseInt(LIMIT_ARG.split('=')[1]) : null;

// Image folders to process
const IMAGE_FOLDERS = TARGET_FOLDER 
    ? [TARGET_FOLDER]
    : ['productImages', 'categoryImages', 'userImages', 'bannerImages'];

// Stats tracking
const stats = {
    total: 0,
    processed: 0,
    skipped: 0,
    errors: 0,
    savedBytes: 0,
};

/**
 * List all objects in a folder
 */
async function listObjects(folder) {
    const objects = [];
    let continuationToken = null;

    do {
        const params = {
            Bucket: BUCKET,
            Prefix: folder + '/',
            ContinuationToken: continuationToken,
        };

        const response = await s3.listObjectsV2(params).promise();
        objects.push(...(response.Contents || []));
        continuationToken = response.IsTruncated ? response.NextContinuationToken : null;
    } while (continuationToken);

    return objects;
}

/**
 * Check if image needs optimization
 */
function needsOptimization(key, size) {
    const ext = key.toLowerCase().split('.').pop();
    
    // Skip if already WebP
    if (ext === 'webp') return false;
    
    // Skip if not an image
    if (!['jpg', 'jpeg', 'png'].includes(ext)) return false;
    
    // Skip very small images (< 10KB) - likely thumbnails
    if (size < 10 * 1024) return false;
    
    return true;
}

/**
 * Optimize a single image
 */
async function optimizeImage(key, originalSize) {
    const isBanner = key.toLowerCase().includes('banner') || key.toLowerCase().includes('hero');
    const maxWidth = isBanner ? 1920 : 1200;

    try {
        // Download original image
        const getParams = { Bucket: BUCKET, Key: key };
        const data = await s3.getObject(getParams).promise();

        // Optimize with sharp
        const optimizedBuffer = await sharp(data.Body)
            .resize(maxWidth, null, {
                withoutEnlargement: true,
                fit: 'inside',
            })
            .webp({
                quality: 80,
                effort: 4,
            })
            .toBuffer();

        // Generate new key with .webp extension
        const newKey = key.replace(/\.(jpg|jpeg|png)$/i, '.webp');

        if (DRY_RUN) {
            const savedBytes = originalSize - optimizedBuffer.length;
            const savedPercent = ((savedBytes / originalSize) * 100).toFixed(1);
            console.log(`  [DRY-RUN] Would convert: ${key}`);
            console.log(`            Original: ${(originalSize / 1024).toFixed(1)} KB`);
            console.log(`            New size: ${(optimizedBuffer.length / 1024).toFixed(1)} KB`);
            console.log(`            Savings:  ${(savedBytes / 1024).toFixed(1)} KB (${savedPercent}%)`);
            return { savedBytes, newKey };
        }

        // Upload optimized image
        const putParams = {
            Bucket: BUCKET,
            Key: newKey,
            Body: optimizedBuffer,
            ContentType: 'image/webp',
            CacheControl: 'public, max-age=31536000, immutable',
        };
        await s3.putObject(putParams).promise();

        // Calculate savings
        const savedBytes = originalSize - optimizedBuffer.length;
        const savedPercent = ((savedBytes / originalSize) * 100).toFixed(1);

        console.log(`  Converted: ${key.split('/').pop()}`);
        console.log(`    ${(originalSize / 1024).toFixed(1)} KB -> ${(optimizedBuffer.length / 1024).toFixed(1)} KB (${savedPercent}% saved)`);

        // Optionally delete original (commented for safety)
        // await s3.deleteObject({ Bucket: BUCKET, Key: key }).promise();

        return { savedBytes, newKey };
    } catch (error) {
        console.error(`  Error processing ${key}: ${error.message}`);
        return null;
    }
}

/**
 * Main migration function
 */
async function migrate() {
    console.log('========================================');
    console.log('S3 Image Migration Script');
    console.log('========================================');
    console.log(`Bucket: ${BUCKET}`);
    console.log(`Folders: ${IMAGE_FOLDERS.join(', ')}`);
    console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no changes)' : 'LIVE'}`);
    if (LIMIT) console.log(`Limit: ${LIMIT} images`);
    console.log('========================================\n');

    if (!BUCKET) {
        console.error('Error: AWS_BUCKET_NAME not set in environment');
        process.exit(1);
    }

    for (const folder of IMAGE_FOLDERS) {
        console.log(`\nProcessing folder: ${folder}/`);
        console.log('-'.repeat(40));

        try {
            const objects = await listObjects(folder);
            console.log(`Found ${objects.length} objects in ${folder}/`);

            let processed = 0;
            for (const obj of objects) {
                if (LIMIT && stats.processed >= LIMIT) {
                    console.log(`\nReached limit of ${LIMIT} images`);
                    break;
                }

                stats.total++;

                if (!needsOptimization(obj.Key, obj.Size)) {
                    stats.skipped++;
                    continue;
                }

                const result = await optimizeImage(obj.Key, obj.Size);
                if (result) {
                    stats.processed++;
                    stats.savedBytes += result.savedBytes;
                    processed++;
                } else {
                    stats.errors++;
                }
            }

            console.log(`\nFolder ${folder}: ${processed} images optimized`);
        } catch (error) {
            console.error(`Error processing folder ${folder}: ${error.message}`);
        }
    }

    // Print summary
    console.log('\n========================================');
    console.log('MIGRATION SUMMARY');
    console.log('========================================');
    console.log(`Total objects scanned: ${stats.total}`);
    console.log(`Images optimized:      ${stats.processed}`);
    console.log(`Images skipped:        ${stats.skipped}`);
    console.log(`Errors:                ${stats.errors}`);
    console.log(`Total space saved:     ${(stats.savedBytes / 1024 / 1024).toFixed(2)} MB`);
    console.log('========================================');

    if (DRY_RUN) {
        console.log('\nThis was a DRY RUN. No changes were made.');
        console.log('Run without --dry-run to apply changes.');
    } else {
        console.log('\nMigration complete!');
        console.log('Note: Original files were NOT deleted.');
        console.log('Update your database URLs to use .webp extension.');
    }
}

// Run migration
migrate().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
