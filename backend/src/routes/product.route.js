const express = require('express');
const {
    getAllProducts,
    getProductById,
    getProductBySlug,
    getProductByPrice,
    getProductByRating,
    createProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/product.controller.js');
const {
    uploadProductImages
} = require('../middlewares/upload.middleware.js');

const router = express.Router();

router.get("/", getAllProducts);
router.get("/slug/:slug", getProductBySlug);
router.get("/price/range", getProductByPrice);
router.get("/:id", getProductById);
router.post("/", uploadProductImages, createProduct);
router.patch("/:id", uploadProductImages, updateProduct);
router.delete("/:id", deleteProduct);

// router.post('/', updateProductImages, createProduct);
// router.patch('/:id/images', updateProductImages, updateProductImages);

module.exports = router;
