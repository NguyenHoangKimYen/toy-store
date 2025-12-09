/**
 * Full Image Migration Script
 * 1. Optimizes all S3 images to WebP
 * 2. Updates all database URLs to point to WebP versions
 * 
 * Usage: node src/scripts/migrate-images-full.js [--dry-run]
 */

require('dotenv').config();
const { execSync } = require('child_process');
const path = require('path');

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║        FULL IMAGE MIGRATION TO WEBP                        ║');
console.log('╠════════════════════════════════════════════════════════════╣');
console.log(`║  Mode: ${DRY_RUN ? 'DRY RUN (preview only)' : 'LIVE (will make changes)'}                         ║`);
console.log('╚════════════════════════════════════════════════════════════╝');
console.log('');

const scriptsDir = __dirname;

try {
    // Step 1: Migrate S3 images
    console.log('STEP 1: Converting S3 images to WebP...');
    console.log('─'.repeat(60));
    
    const s3Script = path.join(scriptsDir, 'migrate-s3-images.js');
    const s3Args = DRY_RUN ? '--dry-run' : '';
    execSync(`node "${s3Script}" ${s3Args}`, { 
        stdio: 'inherit',
        cwd: path.join(scriptsDir, '..', '..')
    });
    
    console.log('');
    
    // Step 2: Update database URLs
    console.log('STEP 2: Updating database URLs...');
    console.log('─'.repeat(60));
    
    const dbScript = path.join(scriptsDir, 'migrate-db-urls.js');
    const dbArgs = DRY_RUN ? '--dry-run' : '';
    execSync(`node "${dbScript}" ${dbArgs}`, { 
        stdio: 'inherit',
        cwd: path.join(scriptsDir, '..', '..')
    });
    
    console.log('');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║                    MIGRATION COMPLETE                       ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    
    if (DRY_RUN) {
        console.log('');
        console.log('This was a DRY RUN. To apply changes, run:');
        console.log('  node src/scripts/migrate-images-full.js');
    } else {
        console.log('');
        console.log('All images have been optimized and URLs updated!');
        console.log('');
        console.log('Next steps:');
        console.log('  1. Test your application to ensure images load correctly');
        console.log('  2. Once verified, you can delete original .jpg/.png files from S3');
        console.log('  3. Consider setting up CloudFront for even better performance');
    }
    
} catch (error) {
    console.error('');
    console.error('Migration failed:', error.message);
    process.exit(1);
}
