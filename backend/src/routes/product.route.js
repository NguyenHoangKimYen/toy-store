const express = require('express');
const { getAllProducts, 
    getProductById, 
    getProductBySlug,
    getProductByPrice,
    getProductByRating,
    createProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/product.controller.js');
const upload = require('../middlewares/upload.middleware.js');

const router = express.Router();

router.get("/", getAllProducts);
router.get("/slug/:slug", getProductBySlug);
router.get("/rating/average", getProductByRating);
router.get("/price/range", getProductByPrice);
router.get("/:id", getProductById);
router.post("/", upload, createProduct);
router.patch("/:id", upload, updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;