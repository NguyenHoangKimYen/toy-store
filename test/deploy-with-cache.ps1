# Deploy frontend to S3 with proper cache headers
# Windows PowerShell version

$BUCKET_NAME = "your-bucket-name"  # Change this
$DIST_FOLDER = "dist"

Write-Host "🚀 Building frontend..." -ForegroundColor Green
npm run build

Write-Host "📦 Uploading to S3 with cache headers..." -ForegroundColor Green

# Upload HTML files (no cache)
Write-Host "📄 Uploading HTML files..." -ForegroundColor Yellow
aws s3 sync $DIST_FOLDER s3://$BUCKET_NAME/ `
  --exclude "*" `
  --include "*.html" `
  --cache-control "public, max-age=0, must-revalidate" `
  --delete

# Upload static assets (long cache)
Write-Host "🎨 Uploading assets with 1-year cache..." -ForegroundColor Yellow
aws s3 sync $DIST_FOLDER s3://$BUCKET_NAME/ `
  --exclude "*.html" `
  --cache-control "public, max-age=31536000, immutable" `
  --delete

Write-Host "✅ Deploy complete!" -ForegroundColor Green
Write-Host "🔄 Invalidating CloudFront cache..." -ForegroundColor Yellow

# Get CloudFront distribution ID (optional)
# $DIST_ID = "YOUR_CLOUDFRONT_DIST_ID"
# aws cloudfront create-invalidation --distribution-id $DIST_ID --paths "/*"

Write-Host "🎉 Done! Cache headers applied." -ForegroundColor Green
