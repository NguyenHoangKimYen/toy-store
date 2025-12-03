const { elasticClient } = require('../config/elasticsearch.js');

const PRODUCTS_INDEX = 'products';

/**
 * Create products index with optimized mappings
 */
const createProductsIndex = async () => {
    try {
        const indexExists = await elasticClient.indices.exists({ index: PRODUCTS_INDEX });
        
        if (indexExists) {
            console.log(`Index '${PRODUCTS_INDEX}' already exists`);
            return;
        }

        await elasticClient.indices.create({
            index: PRODUCTS_INDEX,
            body: {
                settings: {
                    number_of_shards: 1,
                    number_of_replicas: 0,
                    analysis: {
                        analyzer: {
                            // Custom analyzer for product names (Vietnamese support)
                            product_name_analyzer: {
                                type: 'custom',
                                tokenizer: 'standard',
                                filter: ['lowercase', 'asciifolding']
                            },
                            // Edge n-gram for autocomplete
                            autocomplete_analyzer: {
                                type: 'custom',
                                tokenizer: 'standard',
                                filter: ['lowercase', 'asciifolding', 'autocomplete_filter']
                            },
                            // Search analyzer (no edge n-gram)
                            autocomplete_search_analyzer: {
                                type: 'custom',
                                tokenizer: 'standard',
                                filter: ['lowercase', 'asciifolding']
                            }
                        },
                        filter: {
                            autocomplete_filter: {
                                type: 'edge_ngram',
                                min_gram: 2,
                                max_gram: 20
                            }
                        }
                    }
                },
                mappings: {
                    properties: {
                        _id: { type: 'keyword' },
                        name: {
                            type: 'text',
                            analyzer: 'product_name_analyzer',
                            fields: {
                                keyword: { type: 'keyword' },
                                autocomplete: {
                                    type: 'text',
                                    analyzer: 'autocomplete_analyzer',
                                    search_analyzer: 'autocomplete_search_analyzer'
                                }
                            }
                        },
                        slug: {
                            type: 'keyword',
                            fields: {
                                text: { type: 'text' }
                            }
                        },
                        description: {
                            type: 'text',
                            analyzer: 'product_name_analyzer'
                        },
                        categoryId: {
                            type: 'keyword'
                        },
                        categoryName: {
                            type: 'text',
                            analyzer: 'product_name_analyzer',
                            fields: {
                                keyword: { type: 'keyword' }
                            }
                        },
                        minPrice: { type: 'float' },
                        maxPrice: { type: 'float' },
                        averageRating: { type: 'float' },
                        totalReviews: { type: 'integer' },
                        totalStock: { type: 'integer' },
                        totalUnitsSold: { type: 'integer' },
                        isFeatured: { type: 'boolean' },
                        status: { type: 'keyword' },
                        attributes: {
                            type: 'nested',
                            properties: {
                                name: { type: 'keyword' },
                                values: { type: 'keyword' }
                            }
                        },
                        imageUrls: { type: 'keyword' },
                        createdAt: { type: 'date' },
                        updatedAt: { type: 'date' }
                    }
                }
            }
        });

        console.log(`✅ Created index '${PRODUCTS_INDEX}' with optimized mappings`);
    } catch (error) {
        console.error(`❌ Error creating index '${PRODUCTS_INDEX}':`, error.message);
        throw error;
    }
};

/**
 * Delete products index
 */
const deleteProductsIndex = async () => {
    try {
        const indexExists = await elasticClient.indices.exists({ index: PRODUCTS_INDEX });
        
        if (!indexExists) {
            console.log(`Index '${PRODUCTS_INDEX}' does not exist`);
            return;
        }

        await elasticClient.indices.delete({ index: PRODUCTS_INDEX });
        console.log(`✅ Deleted index '${PRODUCTS_INDEX}'`);
    } catch (error) {
        console.error(`❌ Error deleting index '${PRODUCTS_INDEX}':`, error.message);
        throw error;
    }
};

/**
 * Index a single product
 */
const indexProduct = async (product) => {
    try {
        // Prepare document with category names
        const doc = {
            _id: product._id.toString(),
            name: product.name,
            slug: product.slug,
            description: product.description || '',
            categoryId: product.categoryId?.map(cat => 
                typeof cat === 'object' ? cat._id.toString() : cat.toString()
            ) || [],
            categoryName: product.categoryId?.map(cat => 
                typeof cat === 'object' ? cat.name : ''
            ).filter(Boolean) || [],
            minPrice: product.minPrice || 0,
            maxPrice: product.maxPrice || 0,
            averageRating: product.averageRating || 0,
            totalReviews: product.totalReviews || 0,
            totalStock: product.totalStock || 0,
            totalUnitsSold: product.totalUnitsSold || 0,
            isFeatured: product.isFeatured || false,
            status: product.status || 'Draft',
            attributes: product.attributes || [],
            imageUrls: product.imageUrls || [],
            createdAt: product.createdAt,
            updatedAt: product.updatedAt
        };

        await elasticClient.index({
            index: PRODUCTS_INDEX,
            id: doc._id,
            body: doc,
            refresh: 'wait_for'
        });

        console.log(`✅ Indexed product: ${product.name} (${product._id})`);
    } catch (error) {
        console.error(`❌ Error indexing product ${product._id}:`, error.message);
        throw error;
    }
};

/**
 * Bulk index products
 */
const bulkIndexProducts = async (products) => {
    if (!products || products.length === 0) {
        console.log('No products to index');
        return { success: 0, failed: 0 };
    }

    try {
        const body = products.flatMap(product => {
            const doc = {
                _id: product._id.toString(),
                name: product.name,
                slug: product.slug,
                description: product.description || '',
                categoryId: product.categoryId?.map(cat => 
                    typeof cat === 'object' ? cat._id.toString() : cat.toString()
                ) || [],
                categoryName: product.categoryId?.map(cat => 
                    typeof cat === 'object' ? cat.name : ''
                ).filter(Boolean) || [],
                minPrice: product.minPrice || 0,
                maxPrice: product.maxPrice || 0,
                averageRating: product.averageRating || 0,
                totalReviews: product.totalReviews || 0,
                totalStock: product.totalStock || 0,
                totalUnitsSold: product.totalUnitsSold || 0,
                isFeatured: product.isFeatured || false,
                status: product.status || 'Draft',
                attributes: product.attributes || [],
                imageUrls: product.imageUrls || [],
                createdAt: product.createdAt,
                updatedAt: product.updatedAt
            };

            return [
                { index: { _index: PRODUCTS_INDEX, _id: doc._id } },
                doc
            ];
        });

        const result = await elasticClient.bulk({ body, refresh: 'wait_for' });

        const success = result.items.filter(item => !item.index.error).length;
        const failed = result.items.filter(item => item.index.error).length;

        if (failed > 0) {
            console.warn(`⚠️  Bulk index completed with ${failed} failures`);
            result.items.forEach(item => {
                if (item.index.error) {
                    console.error(`   - ${item.index._id}: ${item.index.error.reason}`);
                }
            });
        }

        console.log(`✅ Bulk indexed ${success} products (${failed} failed)`);
        return { success, failed };
    } catch (error) {
        console.error('❌ Error bulk indexing products:', error.message);
        throw error;
    }
};

/**
 * Update a product in the index
 */
const updateProduct = async (productId, updates) => {
    try {
        await elasticClient.update({
            index: PRODUCTS_INDEX,
            id: productId.toString(),
            body: { doc: updates },
            refresh: 'wait_for'
        });

        console.log(`✅ Updated product in index: ${productId}`);
    } catch (error) {
        if (error.meta?.statusCode === 404) {
            console.warn(`⚠️  Product ${productId} not found in index, skipping update`);
            return;
        }
        console.error(`❌ Error updating product ${productId}:`, error.message);
        throw error;
    }
};

/**
 * Delete a product from the index
 */
const deleteProduct = async (productId) => {
    try {
        await elasticClient.delete({
            index: PRODUCTS_INDEX,
            id: productId.toString(),
            refresh: 'wait_for'
        });

        console.log(`✅ Deleted product from index: ${productId}`);
    } catch (error) {
        if (error.meta?.statusCode === 404) {
            console.warn(`⚠️  Product ${productId} not found in index, skipping delete`);
            return;
        }
        console.error(`❌ Error deleting product ${productId}:`, error.message);
        throw error;
    }
};

/**
 * Reindex all products from MongoDB
 */
const reindexAllProducts = async () => {
    try {
        console.log('🔄 Starting reindex of all products...');

        // Delete and recreate index
        await deleteProductsIndex();
        await createProductsIndex();

        // Get all products from MongoDB
        const Product = require('../models/product.model.js');
        const products = await Product.find()
            .populate('categoryId', 'name')
            .lean();

        if (products.length === 0) {
            console.log('No products found in MongoDB');
            return { total: 0, success: 0, failed: 0 };
        }

        // Bulk index
        const result = await bulkIndexProducts(products);

        console.log(`✅ Reindex completed: ${result.success}/${products.length} products indexed`);
        return { total: products.length, ...result };
    } catch (error) {
        console.error('❌ Error reindexing products:', error.message);
        throw error;
    }
};

/**
 * Get index stats
 */
const getIndexStats = async () => {
    try {
        const stats = await elasticClient.indices.stats({ index: PRODUCTS_INDEX });
        const count = await elasticClient.count({ index: PRODUCTS_INDEX });

        return {
            exists: true,
            documentCount: count.count,
            sizeInBytes: stats.indices[PRODUCTS_INDEX]?.total?.store?.size_in_bytes || 0,
            health: stats._shards
        };
    } catch (error) {
        if (error.meta?.statusCode === 404) {
            return { exists: false };
        }
        throw error;
    }
};

module.exports = {
    PRODUCTS_INDEX,
    createProductsIndex,
    deleteProductsIndex,
    indexProduct,
    bulkIndexProducts,
    updateProduct,
    deleteProduct,
    reindexAllProducts,
    getIndexStats
};
