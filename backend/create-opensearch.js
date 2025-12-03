/**
 * Create AWS OpenSearch Domain via AWS SDK
 * Run: node create-opensearch.js
 */

// Load environment variables FIRST
require('dotenv').config({ path: __dirname + '/.env' });

const AWS = require('aws-sdk');

// Debug: Check if credentials loaded
console.log('AWS Region:', process.env.AWS_BUCKET_REGION);
console.log('AWS Key ID loaded:', !!process.env.AWS_ACCESS_KEY_ID);
console.log('AWS Secret loaded:', !!process.env.AWS_SECRET_ACCESS_KEY);
console.log('');

// Configure AWS credentials explicitly
const credentials = new AWS.Credentials({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

// Create ElasticsearchService client (OpenSearch is called ES in AWS SDK v2)
const opensearch = new AWS.ES({
    region: process.env.AWS_BUCKET_REGION || 'ap-southeast-2',
    credentials: credentials,
    apiVersion: '2015-01-01'
});

async function createOpenSearchDomain() {
    console.log('🚀 Creating AWS OpenSearch domain...\n');

    const domainName = 'toy-store-search';

    try {
        // Check if domain already exists
        console.log('📋 Checking if domain exists...');
        try {
            const existing = await opensearch.describeElasticsearchDomain({
                DomainName: domainName
            }).promise();
            
            if (existing.DomainStatus) {
                console.log('\n✅ Domain already exists!');
                console.log(`📍 Endpoint: https://${existing.DomainStatus.Endpoint}`);
                console.log(`📊 Status: ${existing.DomainStatus.Processing ? 'Creating...' : 'Active'}`);
                console.log('\n📝 Add this to your .env file:');
                console.log(`ELASTICSEARCH_NODE=https://${existing.DomainStatus.Endpoint}`);
                return;
            }
        } catch (err) {
            if (!err.code === 'ResourceNotFoundException') {
                throw err;
            }
            console.log('✓ Domain does not exist, creating new one...\n');
        }

        // Create new domain
        console.log('🏗️  Creating OpenSearch domain (this takes 10-15 minutes)...');
        
        const params = {
            DomainName: domainName,
            ElasticsearchVersion: '7.10',  // Use Elasticsearch 7.10 (compatible with OpenSearch)
            ElasticsearchClusterConfig: {
                InstanceType: 't3.small.elasticsearch',
                InstanceCount: 1,
                DedicatedMasterEnabled: false,
                ZoneAwarenessEnabled: false
            },
            EBSOptions: {
                EBSEnabled: true,
                VolumeType: 'gp2',
                VolumeSize: 10
            },
            AccessPolicies: JSON.stringify({
                Version: '2012-10-17',
                Statement: [{
                    Effect: 'Allow',
                    Principal: { AWS: '*' },
                    Action: 'es:*',
                    Resource: `arn:aws:es:${process.env.AWS_BUCKET_REGION || 'ap-southeast-2'}:*:domain/${domainName}/*`
                }]
            }),
            EncryptionAtRestOptions: {
                Enabled: false
            },
            NodeToNodeEncryptionOptions: {
                Enabled: false
            },
            DomainEndpointOptions: {
                EnforceHTTPS: true
            }
        };

        const result = await opensearch.createElasticsearchDomain(params).promise();
        
        console.log('\n✅ OpenSearch domain creation started!');
        console.log(`📍 Domain: ${domainName}`);
        console.log(`📊 Status: Creating (10-15 minutes)`);
        console.log(`💰 Cost: ~$31/month (t3.small.search + 10GB storage)`);
        
        console.log('\n⏳ Waiting for domain to be ready...');
        console.log('   (You can close this and check status later)');
        
        // Poll for domain status
        let attempts = 0;
        const maxAttempts = 60; // 30 minutes max
        
        while (attempts < maxAttempts) {
            attempts++;
            
            // Wait 30 seconds between checks
            await new Promise(resolve => setTimeout(resolve, 30000));
            
            try {
                const status = await opensearch.describeElasticsearchDomain({
                    DomainName: domainName
                }).promise();
                
                const domain = status.DomainStatus;
                
                process.stdout.write(`\r⏳ Status: ${domain.Processing ? 'Creating...' : 'Active'} (${attempts * 30}s elapsed)`);
                
                if (!domain.Processing && domain.Endpoint) {
                    console.log('\n\n🎉 Domain is ready!\n');
                    console.log(`📍 Endpoint: https://${domain.Endpoint}`);
                    console.log(`📊 Health: ${domain.DomainStatus || 'Unknown'}`);
                    
                    console.log('\n📝 Next steps:');
                    console.log('1. Add this to your .env file:');
                    console.log(`   ELASTICSEARCH_NODE=https://${domain.Endpoint}`);
                    console.log('\n2. Restart your backend');
                    console.log('\n3. Run: npm run setup-elasticsearch');
                    console.log('\n4. Test search on your website!');
                    
                    return;
                }
            } catch (pollErr) {
                console.error('\n⚠️  Error checking status:', pollErr.message);
            }
        }
        
        console.log('\n\n⏰ Timeout reached. Domain is still being created.');
        console.log('Check AWS Console or run this script again to get the endpoint.');
        
    } catch (error) {
        console.error('\n❌ Error creating OpenSearch domain:', error.message);
        
        if (error.code === 'LimitExceededException') {
            console.error('\n💡 You may have reached the limit for OpenSearch domains.');
            console.error('   Check AWS Console: https://console.aws.amazon.com/aos/');
        } else if (error.code === 'InvalidTypeException') {
            console.error('\n💡 The instance type might not be available in your region.');
            console.error('   Try using t2.small.search instead.');
        } else if (error.code === 'ValidationException') {
            console.error('\n💡 Check your AWS credentials and permissions.');
        }
        
        throw error;
    }
}

// Run the script
createOpenSearchDomain().catch(err => {
    console.error('\n❌ Script failed:', err.message);
    process.exit(1);
});
