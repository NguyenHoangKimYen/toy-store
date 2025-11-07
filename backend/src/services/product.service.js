const { message } = require('statuses');
const productRepository = require('../repositories/product.repository.js');
const { uploadToS3, deleteFromS3 } = require('../utils/s3.helper.js');

const getAllProducts = async (query) => {
    // Sử dụng URLSearchParams để parse query (hỗ trợ cả object từ req.query)
    const params = new URLSearchParams(Object.entries(query || {}));

    const page = Math.max(1, parseInt(params.get('page') || '1', 10));
    const limit = Math.max(1, parseInt(params.get('limit') || '20', 10));
    const categoryId = params.get('categoryId') || params.get('category') || null;
    const keyword = params.get('keyword') || null;
    const sortParam = params.get('sort') || null; // dạng price:asc hoặc name:desc

    // 2. Xây dựng đối tượng filter cho MongoDB
    const filter = {};
    if (categoryId) filter.categoryId = categoryId;

    // 3. Xử lý keyword
    if (keyword) {
        filter.name = { $regex: keyword, $options: 'i' };
    }

    // 4. Xây dựng đối tượng options (bao gồm cả sort)
    const options = {
        skip: (page - 1) * limit,
        limit: limit,
        sort: {}
    };

    // 5. Xử lý logic cho sort
    if (sortParam) {
        const [field, order] = String(sortParam).split(':');
        if (field) {
            options.sort[field] = order === 'desc' ? -1 : 1;
        } else {
            options.sort.createdAt = -1;
        }
    } else {
        options.sort.createdAt = -1;
    }

    // 6. Gọi repository và thêm thông tin phân trang
    const { products, total } = await productRepository.findAll(filter, options);

    // 7. Trả về kết quả hoàn chỉnh cho controller
    return {
        products,
        pagination: {
            totalProducts: total,
            totalPages: Math.ceil(total / options.limit),
            currentPage: page,
            limit: options.limit
        }
    };
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

const getProductByPrice = (min, max) => {
    return productRepository.findByPrice(min, max);
}

const getProductByRating = (minRating) => {
    return productRepository.findByRating(minRating);
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
        imageUrls: imageUrls,
    };

    return await productRepository.create(product); 
}

const updateProduct = async (id, productData, addImages = [], removeImages = []) => {
    const existingProduct = await productRepository.findById(id);
    if (!existingProduct) throw new Error('Product not found');

    // Upload ảnh mới nếu có
    let uploadedUrls = [];
    if (addImages.length > 0) {
        uploadedUrls = await uploadToS3(addImages);
    }

    // Xóa ảnh cũ khỏi S3 (nếu cần)
    if (removeImages.length > 0) {
        await deleteFromS3(removeImages);
    }

    // Cập nhật danh sách ảnh cuối cùng
    const finalImages = existingProduct.imageUrls
        .filter(url => !removeImages.includes(url))
        .concat(uploadedUrls);

    // Gộp lại dữ liệu update
    const updatedProduct = await productRepository.update(id, {
        ...productData,
        imageUrls: finalImages,
    });

    return updatedProduct;
};

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
    getProductByPrice,
    getProductByRating,
    createProduct,
    updateProduct,
    deleteProduct
};