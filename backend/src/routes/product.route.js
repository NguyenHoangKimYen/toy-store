const express = require('express');
const {
    getAllProducts,
    getProductById,
    getProductBySlug,
    getProductByPrice,
    getProductByRating,
    createProduct,
    updateProduct,
    deleteProduct,
    addProductImages,
    removeProductImages
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
router.delete("/:id", deleteProduct);


router.patch("/:id", updateProduct);
router.post("/:id/images", uploadProductImages, addProductImages);
router.delete("/:id/images", removeProductImages);


module.exports = router;
