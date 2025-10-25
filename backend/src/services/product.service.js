const productRepository = require('../repositories/product.repository.js');
const { uploadToS3 } = require('../utils/s3Upload');

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

const createProduct = async (productData) => {
    return productRepository.create(productData);
}

const updateProduct = async (id, productData) => {
    const updatedProduct = await productRepository.update(id, productData); 
    if (!updatedProduct) {
        throw new Error('Product not found or could not be updated');
    }
    return updatedProduct;
}

const deleteProduct = async (id) => {
    const deletedProduct = await productRepository.remove(id);
    if (!deletedProduct) {
        throw new Error('Product not found or could not be deleted');
    }
    return deletedProduct;
}

const updateProductImages = async (id, imgFiles) => {
    if (!imgFiles || imgFiles.length === 0) {
        throw new Error('No images provided for upload');
    }

    const product = await productRepository.findById(id);
    if (!product) {
        throw new Error('Product not found');
    }

    const uploadedImageUrls = await uploadToS3(imgFiles);
    const updateProduct = await productRepository.updateImages(id, uploadedImageUrls);
    return updateProduct;
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