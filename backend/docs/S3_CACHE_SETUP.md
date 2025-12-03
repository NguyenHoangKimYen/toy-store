# AWS S3 Cache Configuration Guide

## ⚠️ Vấn đề hiện tại
PageSpeed Insights báo: **"Use efficient cache lifetimes - Est savings of 5,572 KiB"**

Tất cả S3 images đang có `Cache-Control: None` → Browser phải download lại mỗi lần reload.

## 🎯 Giải pháp: Set Cache Headers cho S3

### Option 1: AWS Console (Recommended - Dễ nhất)

1. **Vào AWS S3 Console:**
   - Bucket: `toy-store-project-of-springwang`

2. **Set Metadata cho tất cả files:**
   - Select tất cả files trong `productImages/` và `categoryImages/`
   - Actions → Edit metadata
   - Add metadata:
     ```
     Key: Cache-Control
     Value: public, max-age=31536000, immutable
     ```

3. **Click Save**

### Option 2: AWS CLI (Bulk update)

```bash
# Update tất cả product images
aws s3 cp s3://toy-store-project-of-springwang/productImages/ \
  s3://toy-store-project-of-springwang/productImages/ \
  --recursive \
  --metadata-directive REPLACE \
  --cache-control "public, max-age=31536000, immutable" \
  --acl public-read

# Update tất cả category images
aws s3 cp s3://toy-store-project-of-springwang/categoryImages/ \
  s3://toy-store-project-of-springwang/categoryImages/ \
  --recursive \
  --metadata-directive REPLACE \
  --cache-control "public, max-age=31536000, immutable" \
  --acl public-read
```

### Option 3: CloudFront (Best practice cho production)

Nếu có CloudFront trước S3:

```json
{
  "ResponseHeadersPolicyConfig": {
    "Name": "S3-Cache-Policy",
    "CustomHeadersConfig": {
      "Items": [
        {
          "Header": "Cache-Control",
          "Value": "public, max-age=31536000, immutable",
          "Override": true
        }
      ]
    }
  }
}
```

### Option 4: Update upload code

Trong code upload S3, thêm cache headers:

```javascript
const uploadParams = {
  Bucket: process.env.AWS_S3_BUCKET,
  Key: `productImages/${filename}`,
  Body: fileBuffer,
  ContentType: file.mimetype,
  ACL: 'public-read',
  // ADD THIS:
  CacheControl: 'public, max-age=31536000, immutable',
  Metadata: {
    'x-amz-meta-cache': 'immutable'
  }
};
```

## 📊 Expected Results

**Before:**
- ❌ Cache-Control: None
- ❌ Browser downloads ~5.5 MB every reload
- ❌ PageSpeed score: Lower

**After:**
- ✅ Cache-Control: public, max-age=31536000, immutable
- ✅ Browser caches images for 1 year
- ✅ Only download once per device
- ✅ PageSpeed score: +5-10 points
- ✅ Save bandwidth: ~5.5 MB per user per session

## 🔍 Verify

Test cache headers:
```bash
curl -I https://toy-store-project-of-springwang.s3.ap-southeast-2.amazonaws.com/productImages/[any-image].jpg
```

Should see:
```
Cache-Control: public, max-age=31536000, immutable
```

## ⚡ Why this is safe?

1. **Images có UUID trong tên:** `10a0e164-….jpg`
2. **Nếu update image → UUID mới → URL mới**
3. **Browser tự động download version mới**
4. **Immutable = "file này không bao giờ thay đổi"**

## 📝 Monitoring

Track impact qua:
- Google PageSpeed Insights
- Lighthouse CI
- Chrome DevTools → Network tab → Check cache status
