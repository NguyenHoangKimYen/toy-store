/**
 * ElasticSearch Setup and Test Script
 * Run this after starting ElasticSearch to initialize the index
 */

const mongoose = require('mongoose');
require('dotenv').config();

const { testConnection } = require('./src/config/elasticsearch.js');
const { createProductsIndex, reindexAllProducts, getIndexStats } = require('./src/services/elasticsearch.index.service.js');
const connectDB = require('./src/config/db.js');

const setupElasticSearch = async () => {
    console.log('🔧 ElasticSearch Setup Starting...\n');

    try {
        // Step 1: Connect to MongoDB
        console.log('📦 Step 1: Connecting to MongoDB...');
        await connectDB();
        console.log('✅ MongoDB connected\n');

        // Step 2: Test ElasticSearch connection
        console.log('🔍 Step 2: Testing ElasticSearch connection...');
        await testConnection();
        console.log('✅ ElasticSearch connected\n');

        // Step 3: Create index
        console.log('🏗️  Step 3: Creating products index...');
        await createProductsIndex();
        console.log('✅ Index created\n');

        // Step 4: Index all products
        console.log('📊 Step 4: Indexing all products from MongoDB...');
        const result = await reindexAllProducts();
        console.log(`✅ Indexed ${result.success}/${result.total} products\n`);

        // Step 5: Get stats
        console.log('📈 Step 5: Getting index statistics...');
        const stats = await getIndexStats();
        console.log('✅ Index Statistics:');
        console.log(`   - Documents: ${stats.documentCount}`);
        console.log(`   - Size: ${(stats.sizeInBytes / 1024).toFixed(2)} KB`);
        console.log(`   - Health: ${JSON.stringify(stats.health)}\n`);

        console.log('🎉 ElasticSearch setup completed successfully!');
        console.log('\n📝 Next steps:');
        console.log('   1. Start your backend: npm start');
        console.log('   2. Test search: GET /api/products?keyword=robot');
        console.log('   3. Test autocomplete: GET /api/elasticsearch/autocomplete?keyword=rob');
        console.log('   4. View Kibana UI: http://localhost:5601\n');

    } catch (error) {
        console.error('\n❌ Setup failed:', error.message);
        console.error('\nTroubleshooting:');
        console.error('   1. Make sure ElasticSearch is running: docker-compose up -d');
        console.error('   2. Check ElasticSearch logs: docker logs toy-store-elasticsearch');
        console.error('   3. Verify ELASTICSEARCH_NODE in .env file');
        console.error('   4. Test connection: curl http://localhost:9200\n');
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('👋 MongoDB connection closed');
        process.exit(0);
    }
};

// Run setup
setupElasticSearch();
