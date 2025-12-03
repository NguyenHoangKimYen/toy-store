#!/usr/bin/env node
/**
 * Script to add Cache-Control headers to existing S3 files
 * Run: node update-s3-cache-headers.js
 */

require('dotenv').config();
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME;
const FOLDERS = ['productImages', 'categoryImages', 'variantImages', 'reviewImages', 'avatarImages'];

async function listAllObjects(folder) {
  const objects = [];
  let continuationToken = null;

  do {
    const params = {
      Bucket: BUCKET_NAME,
      Prefix: `${folder}/`,
      ContinuationToken: continuationToken,
    };

    const response = await s3.listObjectsV2(params).promise();
    objects.push(...response.Contents);
    continuationToken = response.NextContinuationToken;
  } while (continuationToken);

  return objects;
}

async function updateCacheHeaders(key) {
  try {
    // Copy object to itself with new metadata
    const copyParams = {
      Bucket: BUCKET_NAME,
      CopySource: `${BUCKET_NAME}/${key}`,
      Key: key,
      MetadataDirective: 'REPLACE',
      CacheControl: 'public, max-age=31536000, immutable',
      // ACL removed - bucket uses BucketOwnerEnforced mode
    };

    await s3.copyObject(copyParams).promise();
    console.log(`✅ Updated: ${key}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to update ${key}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting S3 Cache Headers Update...\n');
  console.log(`Bucket: ${BUCKET_NAME}`);
  console.log(`Folders: ${FOLDERS.join(', ')}\n`);

  let totalFiles = 0;
  let updatedFiles = 0;
  let failedFiles = 0;

  for (const folder of FOLDERS) {
    console.log(`\n📁 Processing folder: ${folder}`);
    
    const objects = await listAllObjects(folder);
    console.log(`   Found ${objects.length} files`);

    for (const obj of objects) {
      totalFiles++;
      const success = await updateCacheHeaders(obj.Key);
      if (success) {
        updatedFiles++;
      } else {
        failedFiles++;
      }

      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  console.log('\n📊 Summary:');
  console.log(`   Total files: ${totalFiles}`);
  console.log(`   ✅ Updated: ${updatedFiles}`);
  console.log(`   ❌ Failed: ${failedFiles}`);
  console.log('\n✨ Done!');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
