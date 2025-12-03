# AWS OpenSearch Setup Guide

## Why Use AWS OpenSearch Instead of Docker?

Since you're already on AWS, using **Amazon OpenSearch Service** (managed ElasticSearch) is better because:
- ✅ No Docker installation needed
- ✅ Fully managed (AWS handles updates, backups, scaling)
- ✅ High availability built-in
- ✅ Better integration with your existing AWS infrastructure
- ✅ Pay only for what you use

## Setup AWS OpenSearch (15 minutes)

### Step 1: Create OpenSearch Domain

1. Go to AWS Console → OpenSearch Service
2. Click "Create domain"
3. Choose configuration:
   - **Deployment type**: Development/testing (for now)
   - **Version**: OpenSearch 2.11 (latest)
   - **Instance**: t3.small.search (free tier eligible)
   - **Number of nodes**: 1
   - **EBS storage**: 10 GB
4. Network:
   - Choose **Public access** (easier for testing)
   - Or **VPC access** (more secure, if your EC2 is in VPC)
5. Access policy:
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
         "Resource": "arn:aws:es:ap-southeast-2:YOUR_ACCOUNT:domain/toy-store-search/*"
       }
     ]
   }
   ```
6. Click "Create"
7. Wait 10-15 minutes for domain to be ready

### Step 2: Get Your OpenSearch Endpoint

After creation, you'll see:
```
Domain endpoint: https://search-toy-store-abc123.ap-southeast-2.es.amazonaws.com
```

### Step 3: Update .env File

Replace the local ElasticSearch URL:

```env
# OLD (Docker)
# ELASTICSEARCH_NODE=http://localhost:9200

# NEW (AWS OpenSearch)
ELASTICSEARCH_NODE=https://search-toy-store-abc123.ap-southeast-2.es.amazonaws.com
```

### Step 4: Setup Index (One-Time)

```bash
cd backend
npm run setup-elasticsearch
```

This will:
- Connect to your AWS OpenSearch
- Create the products index
- Index all existing products

### Step 5: Test

Start your backend and search should work immediately!

## Cost Estimate

**Free Tier Eligible Setup:**
- t3.small.search instance: ~$0.04/hour = ~$30/month
- 10 GB storage: ~$1/month
- **Total: ~$31/month**

**Production Setup (later):**
- t3.medium.search x 2 (high availability): ~$120/month
- 50 GB storage: ~$5/month
- **Total: ~$125/month**

## Security Best Practices (After Testing)

### Option 1: IP Whitelist
Add your EC2 server IP to access policy:
```json
{
  "Condition": {
    "IpAddress": {
      "aws:SourceIp": ["YOUR_EC2_IP/32"]
    }
  }
}
```

### Option 2: VPC Access
Put OpenSearch in same VPC as your EC2:
- More secure
- Lower latency
- No public internet exposure

### Option 3: Fine-grained Access Control
Enable built-in authentication:
- Username/password
- IAM roles
- SAML/Cognito

## Monitoring

AWS provides built-in monitoring:
- CloudWatch metrics (free)
- Query performance
- Index size
- Error rates

Dashboard: AWS Console → OpenSearch → Your domain → Monitoring

## No Docker Needed!

The entire ElasticSearch integration I built works with **both**:
- ✅ Local Docker (for development)
- ✅ AWS OpenSearch (for production) ← **Your use case**

Just change the `ELASTICSEARCH_NODE` environment variable!

## Quick Comparison

| Feature | Docker (Local) | AWS OpenSearch |
|---------|---------------|----------------|
| Setup time | 5 min | 15 min |
| Cost | Free | ~$31/month |
| Management | Manual | Fully managed |
| Backups | Manual | Automatic |
| Scaling | Manual | Click to scale |
| High availability | No | Yes (multi-AZ) |
| Best for | Development | Production |

## Recommendation

For your AWS setup:
1. **Skip Docker entirely**
2. **Use AWS OpenSearch** (managed)
3. **Start with t3.small.search** (1 node)
4. **Upgrade later** when traffic grows

Same code, same features, zero Docker required! 🚀
