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

const getProductByPrice = async (req, res, next) => {
    try {
        const { min, max } = req.query;
        const products = await productService.getProductByPrice(parseFloat(min), parseFloat(max));
        return res.json({ success: true, data: products });
    } catch (error) {
        return next(error);
    }
}

const getProductByRating = async (req, res, next) => {
    try {
        const { minRating } = req.query;
        const products = await productService.getProductByRating(parseFloat(minRating));
        return res.json({ success: true, data: products });
    } catch (error) {
        return next(error);
    }
}

const createProduct = async (req, res) => {
    try {
        const product = await productService.createProduct(req.body, req.files);
        res.status(201).json({ success: true, data: product });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        // Kiểm tra ID hợp lệ
        if (!mongo.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }

        let productData = {};
        let removeImages = [];
        let addImages = req.files || [];

        if (req.body.productData) {
            try {
                productData = JSON.parse(req.body.productData);
            } catch (err) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid JSON format in 'productData'",
                });
            }
        } else {
            productData = req.body;
        }

        if (req.body.removeImages) {
            try {
                removeImages = JSON.parse(req.body.removeImages);
            } catch (err) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid JSON format in 'removeImages'",
                });
            }
        }

        const updatedProduct = await productService.updateProduct(
            id,
            productData,
            addImages,
            removeImages
        );

        if (!updatedProduct) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: updatedProduct,
        });
    } catch (error) {
        console.error("Update product error:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};



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

module.exports = {
    getAllProducts,
    getProductById,
    getProductBySlug,
    getProductByPrice,
    getProductByRating,
    createProduct,
    updateProduct,
    deleteProduct,
};