const { message } = require('statuses');
const productRepository = require('../repositories/product.repository.js');
const { uploadToS3 } = require('../utils/s3.helper.js');

const getAllProducts = async (query) => {
    const { page = 1, limit = 20, category, brand, keyword } = query;
    const filter = {};

    if (category) filter.category = category;
    if (brand) filter.brand = brand;
    if (keyword) filter.$text = { $search: keyword };

    const options = {
        skip: (page - 1) * limit,
        limit: parseInt(limit),
    };

    return productRepository.findAll(filter, options);
}

const getProductById = async (id) => {
    const product = await productRepository.findById(id);
    if (!product) {
        throw new Error('Product not found');
    }
    return product;
}

const getProductBySlug = async (slug) => {
    const product = await productRepository.findBySlug(slug);
    if (!product) {
        throw new Error('Product not found');
    }
    return product;
}

const createProduct = async (productData, imgFiles) => {
    // B1: Upload ảnh lên S3
    let imageUrls = [];

    if (imgFiles && imgFiles.length > 0) {
        imageUrls = await uploadToS3(imgFiles);
    }

    // B2: Tạo sản phẩm với URL ảnh
    const product = {
        ...productData,
        images: imageUrls,
    };
    return productRepository.create(productData);
}

const updateProduct = async (id, productData, imgFiles) => {
    let uploadedImageUrls = [];

    // B1: Nếu có ảnh mới, upload lên S3 
    if (imgFiles && imgFiles.length > 0) {
        uploadedImageUrls = await uploadToS3(imgFiles);
        productData.images = uploadedImageUrls;
    }

    // B2: Lấy product hiện tại để giữ ảnh cũ
    const existingProduct = await productRepository.findById(id);
    if (!existingProduct) {
        throw new Error('Product not found');
    }

    // B3: Cập nhật sản phẩm, giữ lại ảnh cũ nếu không có ảnh mới
    const updatedProduct = {
        ...existingProduct,
        ...productData,
        images: productData.images && productData.images.length > 0 
            ? productData.images 
            : existingProduct.images,
    };

    return productRepository.update(id, updatedProduct);
}

const deleteProduct = async (id) => {
    const deletedProduct = await productRepository.remove(id);
    if (!deletedProduct) {
        throw new Error('Product not found or could not be deleted');
    }
    return deletedProduct;
}

const uploadProductImage = async (id) => {
    try {
        const { id } = req.params;
        if (!req.files || req.files.length === 0){
            return res.status(400).json({
                success: false,
                message: 'No files uploaded'
            });
        }
        const urls = await uploadToS3(req.files, 'productImages');
        const product = await productRepository.update(id, { imageUrls: urls});
    } catch (error){
        next(error);
    }
};

module.exports = {
    getAllProducts,
    getProductById,
    getProductBySlug,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadProductImage
};