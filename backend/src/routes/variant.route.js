const express = require('express');
const router = express.Router();
const {
    getVariantById,
    createVariant,
    updateVariant,
    deleteVariant,
    addVariantImages,
    removeVariantImages,
} = require('../controllers/variant.controller');
const { uploadVariantImages } = require('../middlewares/upload.middleware'); // nếu bạn có multer

// CRUD cơ bản
router.get('/:id', getVariantById);
router.post('/:productId', uploadVariantImages, createVariant);
router.patch('/:id', updateVariant);
router.delete('/:id', deleteVariant);

// Quản lý ảnh variant
router.post('/:id/images', uploadVariantImages, addVariantImages);
router.delete('/:id/images', removeVariantImages);

module.exports = router;
