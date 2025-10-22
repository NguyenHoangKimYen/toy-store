const productRepository = require('../repositories/product.repository.js');

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

// Dùng để code logic nè, thay vì ở repository code logic thì code ở đây
const getProductById = async (id) => {
    const product = await productRepository.findById(id);
    if (!product) {
        throw new Error('Product not found');
    }
    return product;
}

const getProductBySlug = async (req, res) => {
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

module.exports = {
    getAllProducts,
    getProductById,
    getProductBySlug,
    createProduct,
    updateProduct,
    deleteProduct
};