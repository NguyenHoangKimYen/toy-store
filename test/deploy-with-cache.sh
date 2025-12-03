#!/bin/bash
# Deploy frontend to S3 with proper cache headers

BUCKET_NAME="your-bucket-name"  # Change this
DIST_FOLDER="dist"

echo "🚀 Building frontend..."
npm run build

echo "📦 Uploading to S3 with cache headers..."

# Upload HTML files (no cache)
echo "📄 Uploading HTML files..."
aws s3 sync $DIST_FOLDER s3://$BUCKET_NAME/ \
  --exclude "*" \
  --include "*.html" \
  --cache-control "public, max-age=0, must-revalidate" \
  --delete

# Upload static assets (long cache)
echo "🎨 Uploading assets with 1-year cache..."
aws s3 sync $DIST_FOLDER s3://$BUCKET_NAME/ \
  --exclude "*.html" \
  --cache-control "public, max-age=31536000, immutable" \
  --delete

echo "✅ Deploy complete!"
echo "🔄 Invalidating CloudFront cache..."

# Get CloudFront distribution ID (optional)
# DIST_ID="YOUR_CLOUDFRONT_DIST_ID"
# aws cloudfront create-invalidation --distribution-id $DIST_ID --paths "/*"

echo "🎉 Done! Cache headers applied."
