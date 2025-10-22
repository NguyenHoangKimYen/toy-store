const productService = require('../services/product.service.js');

const getAllProducts = async (req, res) => {
    try {
        const products = await productService.getAllProducts(req.query);
        res.json({ success: true, data: products });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

const getProductById = async (req, res) => {
    try {
        const product = await productService.getProductById(req.params.id);
        res.json({ success: true, data: product });
    } catch (err) {
        res.status(404).json({ success: false, message: err.message });
    }
}

const getProductBySlug = async (req, res) => {
    try {
        const product = await productService.getProductBySlug(req.params.slug);
        res.json({ success: true, data: product })
    }
    catch (error) {
        res.status(404).json({ success: false, message: error.message });
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
        const product = await productService.updateProduct(req.params.id, req.body);
        res.json({ success: true, data: product });
    }
    catch (error) {
        res.status(400).json({ success: true, message: error.message });
    }
}

const deleteProduct = async (req, res) => {
    try {
        productService.deleteProduct(req.params.id)
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message});
    }
}

module.exports = {
    getAllProducts,
    getProductById,
    getProductBySlug,
    createProduct,
    updateProduct,
    deleteProduct
};