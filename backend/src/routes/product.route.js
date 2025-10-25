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
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);
router.put('/:id/images', upload.array('images', 5), updateProductImages);

module.exports = router;