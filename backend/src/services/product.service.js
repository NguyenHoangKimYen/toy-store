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

  // 🟢 B1: Upload ảnh mới (nếu có)
  if (imgFiles && imgFiles.length > 0) {
    uploadedImageUrls = await uploadToS3(imgFiles, 'productImages');
  }

  // 🟢 B2: Lấy sản phẩm hiện tại để kiểm tra và giữ ảnh cũ
  const existingProduct = await productRepository.findById(id);
  if (!existingProduct) {
    throw new Error('Product not found');
  }

  // 🟢 B3: Nếu có ảnh mới → ghép với ảnh cũ
  const finalImages =
    uploadedImageUrls.length > 0
      ? [...(existingProduct.imageUrls || []), ...uploadedImageUrls]
      : existingProduct.imageUrls;

  // 🟢 B4: Gộp dữ liệu cần update
  const dataToUpdate = {
    ...productData,
    imageUrls: finalImages, // đảm bảo luôn là mảng hợp lệ
  };

  // 🟢 B5: Gọi repository để update trong DB
  const updated = await productRepository.update(id, dataToUpdate);
  if (!updated) {
    throw new Error('Failed to update product');
  }

  return updated;
};

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