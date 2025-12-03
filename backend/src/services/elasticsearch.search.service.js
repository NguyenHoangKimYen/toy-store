const { elasticClient } = require('../config/elasticsearch.js');
const { PRODUCTS_INDEX } = require('./elasticsearch.index.service.js');

/**
 * Search products using ElasticSearch with advanced filtering
 */
const searchProducts = async (query, user = null) => {
    try {
        // Parse query parameters
        const params = new URLSearchParams(Object.entries(query || {}));

        // Pagination
        const page = Math.max(1, parseInt(params.get('page') || '1', 10));
        const limit = Math.max(1, parseInt(params.get('limit') || '20', 10));
        const from = (page - 1) * limit;

        // Keyword search
        const keyword = params.get('keyword') || '';

        // Filters
        const categoryId = params.get('categoryId') || null;
        const minPrice = parseFloat(params.get('minPrice') || '0');
        const maxPrice = parseFloat(params.get('maxPrice') || '0');
        const minRating = parseFloat(params.get('minRating') || '0');
        const isFeatured = params.get('isFeatured') === 'true';
        const daysAgo = parseInt(params.get('daysAgo') || '0', 10);
        const startDate = params.get('startDate') || null;
        const endDate = params.get('endDate') || null;

        // Status filter (admin vs user)
        const isAdmin = user && user.role === 'admin';
        const status = isAdmin ? null : 'Published';

        // Sort
        const sortParam = params.get('sort') || 'createdAt:desc';
        const [sortField, sortOrder] = sortParam.split(':');

        // Build ElasticSearch query
        const mustClauses = [];
        const filterClauses = [];

        // Keyword search with multi-field matching and boosting
        if (keyword) {
            mustClauses.push({
                multi_match: {
                    query: keyword,
                    fields: [
                        'name^3',                    // Boost name matches most
                        'name.autocomplete^2',       // Autocomplete support
                        'description',               // Description matches
                        'categoryName^1.5',          // Category name matches
                        'slug.text'                  // Slug text matches
                    ],
                    type: 'best_fields',
                    fuzziness: 'AUTO',              // Auto fuzzy matching for typos
                    prefix_length: 2,               // Require at least 2 chars to match exactly
                    operator: 'or'
                }
            });
        }

        // Category filter
        if (categoryId) {
            filterClauses.push({
                term: { categoryId: categoryId }
            });
        }

        // Price range filter (overlap logic)
        if (minPrice > 0) {
            filterClauses.push({
                range: { maxPrice: { gte: minPrice } }
            });
        }
        if (maxPrice > 0) {
            filterClauses.push({
                range: { minPrice: { lte: maxPrice } }
            });
        }

        // Rating filter
        if (minRating > 0) {
            filterClauses.push({
                range: { averageRating: { gte: minRating } }
            });
        }

        // Featured filter
        if (isFeatured) {
            filterClauses.push({
                term: { isFeatured: true }
            });
        }

        // Status filter
        if (status) {
            filterClauses.push({
                term: { status: status }
            });
        }

        // Date range filters
        const dateRange = {};
        if (daysAgo > 0) {
            const pastDate = new Date();
            pastDate.setDate(pastDate.getDate() - daysAgo);
            dateRange.gte = pastDate.toISOString();
        } else if (startDate) {
            dateRange.gte = new Date(startDate).toISOString();
        }

        if (endDate) {
            const endOfDay = new Date(endDate);
            endOfDay.setHours(23, 59, 59, 999);
            dateRange.lte = endOfDay.toISOString();
        }

        if (Object.keys(dateRange).length > 0) {
            filterClauses.push({
                range: { createdAt: dateRange }
            });
        }

        // Build final query
        const esQuery = {
            bool: {
                must: mustClauses.length > 0 ? mustClauses : [{ match_all: {} }],
                filter: filterClauses
            }
        };

        // Sort configuration
        const sortConfig = [];
        if (keyword) {
            // When searching, sort by relevance first
            sortConfig.push({ _score: { order: 'desc' } });
        }

        // Add explicit sort field
        const sortMap = {
            name: 'name.keyword',
            price: 'minPrice',
            rating: 'averageRating',
            stock: 'totalStock',
            sold: 'totalUnitsSold',
            createdAt: 'createdAt',
            updatedAt: 'updatedAt'
        };

        const esSortField = sortMap[sortField] || 'createdAt';
        sortConfig.push({
            [esSortField]: { order: sortOrder === 'asc' ? 'asc' : 'desc' }
        });

        // Execute search
        const response = await elasticClient.search({
            index: PRODUCTS_INDEX,
            body: {
                query: esQuery,
                sort: sortConfig,
                from: from,
                size: limit,
                track_total_hits: true
            }
        });

        // Extract results
        const products = response.hits.hits.map(hit => ({
            ...hit._source,
            _score: hit._score  // Include relevance score
        }));

        const total = typeof response.hits.total === 'object' 
            ? response.hits.total.value 
            : response.hits.total;

        return {
            products,
            pagination: {
                totalProducts: total,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                limit
            },
            searchInfo: {
                usingElasticSearch: true,
                keyword: keyword || null,
                took: response.took  // Search time in ms
            }
        };

    } catch (error) {
        console.error('❌ ElasticSearch search error:', error.message);
        // Return error to allow fallback to MongoDB
        throw error;
    }
};

/**
 * Autocomplete suggestions based on product names
 */
const autocomplete = async (keyword, limit = 10) => {
    try {
        if (!keyword || keyword.length < 2) {
            return [];
        }

        const response = await elasticClient.search({
            index: PRODUCTS_INDEX,
            body: {
                query: {
                    bool: {
                        must: [
                            {
                                match: {
                                    'name.autocomplete': {
                                        query: keyword,
                                        fuzziness: 'AUTO'
                                    }
                                }
                            }
                        ],
                        filter: [
                            { term: { status: 'Published' } }
                        ]
                    }
                },
                _source: ['name', 'slug', 'imageUrls', 'minPrice', 'maxPrice'],
                size: limit,
                sort: [
                    { _score: { order: 'desc' } },
                    { totalUnitsSold: { order: 'desc' } }
                ]
            }
        });

        return response.hits.hits.map(hit => ({
            name: hit._source.name,
            slug: hit._source.slug,
            image: hit._source.imageUrls?.[0] || null,
            priceRange: {
                min: hit._source.minPrice,
                max: hit._source.maxPrice
            },
            score: hit._score
        }));

    } catch (error) {
        console.error('❌ ElasticSearch autocomplete error:', error.message);
        throw error;
    }
};

/**
 * Get similar products based on categories and attributes
 */
const getSimilarProducts = async (productId, limit = 6) => {
    try {
        // First, get the product details
        const product = await elasticClient.get({
            index: PRODUCTS_INDEX,
            id: productId.toString()
        });

        const source = product._source;

        // Build query for similar products
        const shouldClauses = [];

        // Same categories (highest weight)
        if (source.categoryId && source.categoryId.length > 0) {
            shouldClauses.push({
                terms: {
                    categoryId: source.categoryId,
                    boost: 3
                }
            });
        }

        // Similar price range
        if (source.minPrice > 0) {
            const priceBuffer = source.maxPrice * 0.3; // ±30% price range
            shouldClauses.push({
                range: {
                    minPrice: {
                        gte: Math.max(0, source.minPrice - priceBuffer),
                        lte: source.maxPrice + priceBuffer,
                        boost: 1.5
                    }
                }
            });
        }

        // Similar attributes
        if (source.attributes && source.attributes.length > 0) {
            source.attributes.forEach(attr => {
                shouldClauses.push({
                    nested: {
                        path: 'attributes',
                        query: {
                            bool: {
                                must: [
                                    { term: { 'attributes.name': attr.name } },
                                    { terms: { 'attributes.values': attr.values } }
                                ]
                            }
                        },
                        boost: 2
                    }
                });
            });
        }

        const response = await elasticClient.search({
            index: PRODUCTS_INDEX,
            body: {
                query: {
                    bool: {
                        must_not: [
                            { term: { _id: productId.toString() } }  // Exclude current product
                        ],
                        should: shouldClauses,
                        minimum_should_match: 1,
                        filter: [
                            { term: { status: 'Published' } }
                        ]
                    }
                },
                sort: [
                    { _score: { order: 'desc' } },
                    { averageRating: { order: 'desc' } },
                    { totalUnitsSold: { order: 'desc' } }
                ],
                size: limit
            }
        });

        return response.hits.hits.map(hit => ({
            ...hit._source,
            _score: hit._score
        }));

    } catch (error) {
        console.error('❌ ElasticSearch similar products error:', error.message);
        throw error;
    }
};

/**
 * Get trending/popular products
 */
const getTrendingProducts = async (limit = 10, daysAgo = 30) => {
    try {
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - daysAgo);

        const response = await elasticClient.search({
            index: PRODUCTS_INDEX,
            body: {
                query: {
                    bool: {
                        filter: [
                            { term: { status: 'Published' } },
                            { range: { totalStock: { gt: 0 } } }
                        ]
                    }
                },
                sort: [
                    { totalUnitsSold: { order: 'desc' } },
                    { averageRating: { order: 'desc' } },
                    { totalReviews: { order: 'desc' } }
                ],
                size: limit
            }
        });

        return response.hits.hits.map(hit => hit._source);

    } catch (error) {
        console.error('❌ ElasticSearch trending products error:', error.message);
        throw error;
    }
};

/**
 * Check if ElasticSearch is available
 */
const isElasticSearchAvailable = async () => {
    try {
        await elasticClient.ping();
        const indexExists = await elasticClient.indices.exists({ index: PRODUCTS_INDEX });
        return indexExists;
    } catch (error) {
        return false;
    }
};

module.exports = {
    searchProducts,
    autocomplete,
    getSimilarProducts,
    getTrendingProducts,
    isElasticSearchAvailable
};
