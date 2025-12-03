const { Client } = require('@elastic/elasticsearch');

const elasticClient = new Client({
    node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
    maxRetries: 5,
    requestTimeout: 60000,
    sniffOnStart: false,
});

// Test connection
const testConnection = async () => {
    try {
        const health = await elasticClient.cluster.health();
        console.log('✅ ElasticSearch connected successfully');
        console.log(`   Status: ${health.status}`);
        console.log(`   Node: ${process.env.ELASTICSEARCH_NODE || 'http://localhost:9200'}`);
    } catch (error) {
        console.error('❌ ElasticSearch connection failed:', error.message);
        console.error('   Continuing without ElasticSearch...');
    }
};

module.exports = { elasticClient, testConnection };
