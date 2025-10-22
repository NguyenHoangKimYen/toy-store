const express = require('express');
const { getAllProducts, 
    getProductById, 
    getProductBySlug,
    createProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/product.controller.js');


const router = express.Router();

router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.get("/slug/:slug", getProductBySlug);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;