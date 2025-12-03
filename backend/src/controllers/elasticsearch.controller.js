const { 
    createProductsIndex, 
    reindexAllProducts, 
    getIndexStats,
    deleteProductsIndex 
} = require('../services/elasticsearch.index.service.js');
const { autocomplete, getSimilarProducts, getTrendingProducts } = require('../services/elasticsearch.search.service.js');

/**
 * Initialize ElasticSearch index
 */
const initializeIndex = async (req, res, next) => {
    try {
        await createProductsIndex();
        res.json({ 
            success: true, 
            message: 'ElasticSearch index created successfully' 
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Reindex all products from MongoDB to ElasticSearch
 */
const reindex = async (req, res, next) => {
    try {
        const result = await reindexAllProducts();
        res.json({ 
            success: true, 
            message: 'Products reindexed successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get index statistics
 */
const getStats = async (req, res, next) => {
    try {
        const stats = await getIndexStats();
        res.json({ 
            success: true, 
            data: stats
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete index
 */
const deleteIndex = async (req, res, next) => {
    try {
        await deleteProductsIndex();
        res.json({ 
            success: true, 
            message: 'ElasticSearch index deleted successfully' 
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Autocomplete product search
 */
const getAutocomplete = async (req, res, next) => {
    try {
        const { keyword } = req.query;
        const limit = parseInt(req.query.limit || '10', 10);
        
        if (!keyword) {
            return res.json({ success: true, data: [] });
        }

        const suggestions = await autocomplete(keyword, limit);
        res.json({ 
            success: true, 
            data: suggestions
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get similar products
 */
const getSimilar = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const limit = parseInt(req.query.limit || '6', 10);
        
        const products = await getSimilarProducts(productId, limit);
        res.json({ 
            success: true, 
            data: products
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get trending products
 */
const getTrending = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit || '10', 10);
        const daysAgo = parseInt(req.query.daysAgo || '30', 10);
        
        const products = await getTrendingProducts(limit, daysAgo);
        res.json({ 
            success: true, 
            data: products
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    initializeIndex,
    reindex,
    getStats,
    deleteIndex,
    getAutocomplete,
    getSimilar,
    getTrending
};
