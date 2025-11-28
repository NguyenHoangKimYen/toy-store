const express = require('express');
const router = express.Router();
const {
    createCategory,
    getAllCategories,
    getCategoryById,
    getCategoryBySlug,
    updateCategory,
    deleteCategory,
} = require('../controllers/category.controller.js');

const { uploadCategoryImages } = require('../middlewares/upload.middleware.js');

router.post('/', uploadCategoryImages, createCategory);

router.get('/', getAllCategories);
router.get('/slug/:slug', getCategoryBySlug);
router.get('/:id', getCategoryById);

router.patch('/:id', uploadCategoryImages, updateCategory);

router.delete('/:id', deleteCategory);

module.exports = router;
