const categoryService = require('../services/category.service.js');
const { mongo } = require('mongoose');

/** Tạo mới */
const createCategory = async (req, res, next) => {
    try {
        const category = await categoryService.createCategory(
            req.body,
            req.files,
        );
        const category = await categoryService.createCategory(
            req.body,
            req.files,
        );
        res.status(201).json({ success: true, data: category });
    } catch (err) {
        next(err); // Chuyển lỗi cho error handler
    }
};

/** Lấy tất cả */
const getAllCategories = async (req, res, next) => {
    try {
        const categories = await categoryService.getAllCategories();
        res.status(200).json({ success: true, data: categories });
    } catch (err) {
        next(err);
    }
};

/** Lấy theo ID */
const getCategoryById = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!mongo.ObjectId.isValid(id)) {
            return res
                .status(400)
                .json({ success: false, message: 'Invalid ID format' });
        }
        const category = await categoryService.getCategoryById(id);
        res.status(200).json({ success: true, data: category });
    } catch (err) {
        next(err); // Sẽ bắt lỗi "Not found" từ service
    }
};

/** Lấy theo Slug */
const getCategoryBySlug = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const category = await categoryService.getCategoryBySlug(slug);
        res.status(200).json({ success: true, data: category });
    } catch (err) {
        next(err);
    }
};

/** Cập nhật */
const updateCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!mongo.ObjectId.isValid(id)) {
            return res
                .status(400)
                .json({ success: false, message: 'Invalid ID format' });
        }

        const category = await categoryService.updateCategory(
            id,
            req.body,
            req.files,
        );
        res.status(200).json({ success: true, data: category });
    } catch (err) {
        next(err);
    }
};

/** Xóa */
const deleteCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!mongo.ObjectId.isValid(id)) {
            return res
                .status(400)
                .json({ success: false, message: 'Invalid ID format' });
        }
        const result = await categoryService.deleteCategory(id);
        res.status(200).json({ success: true, message: result.message });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    createCategory,
    getAllCategories,
    getCategoryById,
    getCategoryBySlug,
    updateCategory,
    deleteCategory,
};
