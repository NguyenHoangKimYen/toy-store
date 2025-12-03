const express = require('express');
const {
    initializeIndex,
    reindex,
    getStats,
    deleteIndex,
    getAutocomplete,
    getSimilar,
    getTrending
} = require('../controllers/elasticsearch.controller.js');

const authMiddleware = require('../middlewares/auth.middleware.js');
const adminOnly = require('../middlewares/admin.middleware.js');

const router = express.Router();

// Public routes
router.get('/autocomplete', getAutocomplete);
router.get('/similar/:productId', getSimilar);
router.get('/trending', getTrending);

// Admin routes
router.use(authMiddleware);
router.use(adminOnly);
router.post('/index/create', initializeIndex);
router.post('/index/reindex', reindex);
router.get('/index/stats', getStats);
router.delete('/index', deleteIndex);

module.exports = router;
