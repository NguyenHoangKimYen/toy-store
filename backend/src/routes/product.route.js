const express = require('express');
const {
    getAllProducts,
    getProductById,
    getProductBySlug,
    createProduct,
    updateProduct,
    deleteProduct,
    updateProductImages,
} = require('../controllers/product.controller.js');
const { uploadProductImages: uploadProductImagesMiddleware } = require('../middlewares/upload.middleware.js');

const router = express.Router();

router.get('/', getAllProducts);
router.get('/slug/:slug', getProductBySlug);
router.get('/:id', getProductById);
router.put('/:id', uploadProductImagesMiddleware, updateProduct);
router.delete('/:id', deleteProduct);

router.post('/', uploadProductImagesMiddleware, createProduct);
router.patch('/:id/images', uploadProductImagesMiddleware, updateProductImages);

module.exports = router;
