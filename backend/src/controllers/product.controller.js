const { mongo } = require('mongoose');
const productService = require('../services/product.service.js');

/** Lấy danh sách sản phẩm */
const getAllProducts = async (req, res, next) => {
    try {
        const result = await productService.getAllProducts(req.query);
        res.json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
};

/** Lấy chi tiết sản phẩm theo ID */
const getProductById = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!mongo.ObjectId.isValid(id))
            return res
                .status(400)
                .json({ success: false, message: 'Invalid ID' });

        const product = await productService.getProductById(id);
        if (!product) {
            return res
                .status(404)
                .json({ success: false, message: 'Product not found' });
        }
        res.json({ success: true, data: product });
    } catch (err) {
        next(err);
    }
};

const getProductBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const product = await productService.getProductBySlug(slug);
        if (!product) {
            return res
                .status(404)
                .json({ success: false, message: 'Product not found' });
        }
        return res.json({ success: true, data: product });
    } catch (error) {
        return next(error);
    }
};

const getProductByPrice = async (req, res, next) => {
    try {
        const { min, max } = req.query;
        const products = await productService.getProductByPrice(
            parseFloat(min),
            parseFloat(max),
        );
        return res.json({ success: true, data: products });
    } catch (error) {
        return next(error);
    }
};

const getProductByRating = async (req, res, next) => {
    try {
        const { minRating } = req.query;
        const products = await productService.getProductByRating(
            parseFloat(minRating),
        );
        return res.json({ success: true, data: products });
    } catch (error) {
        return next(error);
    }
};

/** Tạo sản phẩm mới */
const createProduct = async (req, res) => {
    try {
        const product = await productService.createProduct(req.body, req.files);
        res.status(201).json({ success: true, data: product });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/** Cập nhật thông tin sản phẩm */
const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongo.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID',
            });
        }

        // Expect JSON body with product data
        // Images are handled separately via POST/DELETE /products/:id/images
        console.log('📝 Update Product Request:', req.body);
        
        const updatedProduct = await productService.updateProduct(id, req.body);

        return res.status(200).json({
            success: true,
            data: updatedProduct,
        });
    } catch (error) {
        console.error('❌ Update Product Error:', error.message);
        next(error);
    }
};

/** Xóa sản phẩm (và ảnh S3) */
const deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await productService.deleteProduct(id);
        res.json({ success: true, message: result.message });
    } catch (err) {
        next(err);
    }
};

/** Thêm ảnh (upload lên S3) */
const addProductImages = async (req, res, next) => {
    try {
        const { id } = req.params;
        const files = req.files;
        if (!files?.length)
            return res.status(400).json({ message: 'No files uploaded' });

        const updated = await productService.addImagesToProduct(id, files);
        res.json({ success: true, data: updated });
    } catch (err) {
        next(err);
    }
};

/** Xóa ảnh sản phẩm */
const removeProductImages = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { removeImages } = req.body;
        if (!Array.isArray(removeImages) || !removeImages.length)
            return res.status(400).json({ message: 'No image URLs provided' });

        const updated = await productService.removeImagesFromProduct(
            id,
            removeImages,
        );
        res.json({ success: true, data: updated });
    } catch (err) {
        next(err);
    }
};

/** Upload ảnh trực tiếp lên S3 (không cần productId) */
const uploadImagesToS3 = async (req, res, next) => {
    try {
        if (!req.files) {
            return res.status(400).json({ 
                success: false,
                message: 'No files uploaded - req.files is undefined' 
            });
        }
        
        const files = req.files;
        if (!files.length) {
            return res.status(400).json({ 
                success: false,
                message: 'No files uploaded - files array is empty' 
            });
        }

        const { uploadToS3 } = require('../utils/s3.helper.js');
        const uploadedUrls = await uploadToS3(files, 'productImages');
        
        res.json({ 
            success: true, 
            imageUrls: uploadedUrls,
            message: `Uploaded ${uploadedUrls.length} images successfully`
        });
    } catch (err) {
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: err.message || 'Failed to upload images'
            });
        }
    }
};

module.exports = {
    getAllProducts,
    getProductById,
    getProductBySlug,
    getProductByPrice,
    getProductByRating,
    createProduct,
    updateProduct,
    deleteProduct,
    addProductImages,
    removeProductImages,
    uploadImagesToS3,
};
