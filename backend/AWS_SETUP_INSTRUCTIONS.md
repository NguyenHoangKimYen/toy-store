# AWS OpenSearch Setup - Step by Step Guide

## Step 1: Create OpenSearch Domain in AWS Console

1. **Open AWS Console**: https://console.aws.amazon.com/
2. **Navigate to OpenSearch Service**:
   - Search for "OpenSearch" in the search bar
   - Click "Amazon OpenSearch Service"

3. **Click "Create domain"**

4. **Domain Configuration**:
   ```
   Domain name: toy-store-search
   ```

5. **Deployment Type**:
   - Select: "Development and testing"
   - This uses 1 node (cheaper for testing)

6. **Version**:
   - Select: "OpenSearch 2.11" (latest)

7. **Data nodes**:
   - Instance type: t3.small.search (free tier eligible)
   - Number of nodes: 1
   - EBS storage: 10 GB

8. **Network**:
   - Select: "Public access"
   - (This makes testing easier - you can switch to VPC later)

9. **Fine-grained access control**:
   - Uncheck "Enable fine-grained access control"
   - (Makes testing easier)

10. **Access policy**:
    - Select "Only use fine-grained access control"
    - Or use this policy for open access (testing only):
    ```json
    {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Effect": "Allow",
          "Principal": {
            "AWS": "*"
          },
          "Action": "es:*",
          "Resource": "arn:aws:es:ap-southeast-2:*:domain/toy-store-search/*"
        }
      ]
    }
    ```

11. **Click "Create"**

12. **Wait 10-15 minutes** for domain to be created
    - Status will change from "Loading" to "Active"
    - Domain health will show "Green"

## Step 2: Get Your OpenSearch Endpoint

Once created, you'll see:
```
Domain endpoint: https://search-toy-store-abc123.ap-southeast-2.es.amazonaws.com
```

**Copy this URL!** You'll need it next.

## Step 3: Update Backend Configuration

Open your `.env` file and add:
```env
ELASTICSEARCH_NODE=https://search-toy-store-abc123.ap-southeast-2.es.amazonaws.com
```

Replace with YOUR actual endpoint from Step 2.

## Step 4: Restart Backend

The backend should automatically reconnect:
- You should see: ✅ ElasticSearch connected successfully
- No more: ❌ ElasticSearch connection failed

## Step 5: Index Your Products

Run this command once to index all products:
```bash
cd f:\Desktop\ecm\toy-store\backend
npm run setup-elasticsearch
```

This will:
- Connect to OpenSearch
- Create the products index
- Index all your existing products (~150 products)
- Show statistics

Expected output:
```
✅ MongoDB connected
✅ ElasticSearch connected
✅ Index created
✅ Indexed 150/150 products
📈 Index Statistics:
   - Documents: 150
   - Size: 512 KB
🎉 ElasticSearch setup completed successfully!
```

## Step 6: Test Search

1. Restart your backend (if not already done)
2. Go to your website
3. Use the search bar
4. Type any product name
5. Search should be 10-20x faster!

Backend logs should show:
```
🔍 Using ElasticSearch for product search
```

## Verification Checklist

- [ ] AWS OpenSearch domain created (Status: Active)
- [ ] Domain endpoint copied
- [ ] ELASTICSEARCH_NODE added to .env
- [ ] Backend restarted (shows ✅ ElasticSearch connected)
- [ ] Products indexed (npm run setup-elasticsearch)
- [ ] Search tested on website
- [ ] Backend logs show "Using ElasticSearch"

## Cost

**Development Setup (what you're creating)**:
- t3.small.search: ~$0.04/hour = ~$30/month
- 10 GB storage: ~$1/month
- **Total: ~$31/month**

**Can delete anytime to stop charges!**

## Troubleshooting

### Can't access OpenSearch endpoint
- Check security group allows HTTPS (443)
- Verify access policy allows connections
- Try from your EC2 if using VPC

### Backend still says "ElasticSearch connection failed"
- Double-check ELASTICSEARCH_NODE in .env
- Make sure you copied the full URL with https://
- Restart backend after changing .env
- Check AWS domain status is "Active"

### Setup script fails
- Make sure backend can connect to internet
- Check AWS credentials if using VPC
- Verify OpenSearch domain is active

## Next Steps

After successful setup, you can:
1. Test search performance (should be ~15ms vs ~200ms)
2. Test fuzzy search (typos should work)
3. Test autocomplete endpoint
4. Add autocomplete to frontend
5. Monitor in AWS CloudWatch

---

**Ready to start? Follow Step 1 above!**
