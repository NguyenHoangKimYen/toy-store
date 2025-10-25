const { mongo } = require('mongoose');
const productService = require('../services/product.service.js');

const getAllProducts = async (req, res, next) => {
    try {
        const products = await productService.getAllProducts(req.query);
        res.json({ success: true, data: products });
    }
    catch (error) {
        return next(error); //error middleware will handle this
    }
}

const getProductById = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!mongo.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid product ID" });
        }
        const product = await productService.getProductById(id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        return res.json({ success: true, data: product });
    } catch (error) {
        return next(error);
    }
}

const getProductBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const product = await productService.getProductBySlug(slug);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        return res.json({ success: true, data: product });
    } catch (error) {
        return next(error);
    }
}

const createProduct = async (req, res) => {
    try {
        const product = await productService.createProduct(req.body);
        res.status(201).json({ success: true, data: product });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongo.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid product ID" });
        }
        const product = await productService.updateProduct(id, req.body);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        return res.json({ success: true, data: product });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongo.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid product ID" });
        }
        const deleted = await productService.deleteProduct(id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        return res.status(204).send();
    }
    catch (error) {
        return next(error);
    }
}

const updateProductImages = async (req, res, next) => {
    try {
        const { id } = req.params;
        const files = req.files;

        const product = await productService.updateProductImages(id, files);

        return res.json({
            message: 'Product images updated successfully',
            data: product,
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    getAllProducts,
    getProductById,
    getProductBySlug,
    createProduct,
    updateProduct,
    deleteProduct,
    updateProductImages
};