const productRepository = require('../repositories/product.repository.js');
const { uploadToS3, deleteFromS3 } = require('../utils/s3.helper.js');

const getAllProducts = async (query) => {
    // 1. Destructure tất cả các query params
    const {
        page = 1,
        limit = 20,
        categoryId, // <-- Đổi tên từ 'category' để khớp '?categoryId=...'
        keyword,
        sort // <-- Thêm trường sort
    } = query;

    // 2. Xây dựng đối tượng filter cho MongoDB
    const filter = {};
    if (categoryId) filter.categoryId = categoryId; // <-- Sửa ở đây

    // 3. Xử lý keyword
    if (keyword) {
        // Tùy chọn 2: Dùng Regex (linh hoạt hơn, không cần text index)
        // Tìm kiếm không phân biệt hoa thường trên trường 'name' (hoặc trường bạn muốn)
        filter.name = { $regex: keyword, $options: 'i' };
    }

    // 4. Xây dựng đối tượng options (bao gồm cả sort)
    const options = {
        skip: (page - 1) * limit,
        limit: parseInt(limit),
        sort: {} // Khởi tạo đối tượng sort
    };

    // 5. Xử lý logic cho sort
    // Query sẽ có dạng: ?sort=price:asc hoặc ?sort=name:desc
    if (sort) {
        const [field, order] = sort.split(':');
        options.sort[field] = order === 'desc' ? -1 : 1; // 1 = asc, -1 = desc
    } else {
        // Mặc định sắp xếp theo ngày tạo mới nhất
        options.sort.createdAt = -1;
    }

    // 6. Gọi repository và thêm thông tin phân trang
    // Chúng ta cần repository trả về cả tổng số sản phẩm
    const { products, total } = await productRepository.findAll(filter, options);

    // 7. Trả về kết quả hoàn chỉnh cho controller
    return {
        products,
        pagination: {
            totalProducts: total,
            totalPages: Math.ceil(total / options.limit),
            currentPage: parseInt(page),
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