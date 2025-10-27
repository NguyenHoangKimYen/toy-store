const express = require('express');
const { getAllProducts, 
    getProductById, 
    getProductBySlug,
    createProduct,
    updateProduct,
    deleteProduct,
    updateProductImages
} = require('../controllers/product.controller.js');
const upload = require('../middlewares/upload.middleware.js');

const router = express.Router();

router.get("/", getAllProducts);
router.get("/slug/:slug", getProductBySlug);
router.get("/:id", getProductById);
router.post("/", upload, createProduct);
router.put("/:id", upload, updateProduct);
router.delete("/:id", deleteProduct);
router.put('/:id/images', upload, updateProductImages);

module.exports = router;