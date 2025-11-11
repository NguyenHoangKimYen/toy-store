const productRepository = require("../repositories/product.repository.js");
const variantRepository = require("../repositories/variant.repository.js");
const { uploadToS3, deleteFromS3 } = require("../utils/s3.helper.js");

/**
 * Lấy danh sách sản phẩm (có lọc + phân trang)
 */
const getAllProducts = async (query) => {
    const params = new URLSearchParams(Object.entries(query || {}));

    const page = Math.max(1, parseInt(params.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(params.get("limit") || "20", 10));
    const categoryId = params.get("categoryId") || null;
    const keyword = params.get("keyword") || null;
    const sortParam = params.get("sort") || null;

    const filter = {};
    if (categoryId) filter.categoryId = categoryId;
    if (keyword) filter.name = { $regex: keyword, $options: "i" };

    const options = {
        skip: (page - 1) * limit,
        limit,
        sort: {},
    };
    options.sort[sortParam?.split(":")[0] || "createdAt"] =
        sortParam?.endsWith("desc") ? -1 : -1;

    const { products, total } = await productRepository.findAll(filter, options);

    return {
        products,
        pagination: {
            totalProducts: total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            limit,
        },
    };
};

/**
 * Lấy chi tiết sản phẩm theo ID
 */
const getProductById = async (id) => {
    const product = await productRepository.findById(id);
    if (!product) throw new Error("Product not found");
    return product;
};

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

/**
 * Tạo sản phẩm mới (chưa bao gồm ảnh)
 */
const createProduct = async (productData, imgFiles) => {

    if (typeof productData.attributes === 'string') {
        productData.attributes = JSON.parse(productData.attributes);
    }

    let imageUrls = [];

    if (imgFiles && imgFiles.length > 0) {
        imageUrls = await uploadToS3(imgFiles, "productImages");
    }

    const product = {
        ...productData,
        imageUrls: imageUrls,
    };

    return await productRepository.create(product);
};

/**
 * Cập nhật thông tin sản phẩm (trừ ảnh)
 */

// TRONG product.service.js

/**
 * Cập nhật thông tin sản phẩm (trừ ảnh)
 */
// Sửa chữ ký hàm: nhận (id, body, files)
const updateProduct = async (id, body, files = []) => {

    // --- BƯỚC 1: XỬ LÝ LOGIC PARSING (Chuyển từ controller sang) ---
    let productData = {};
    let removeImages = [];
    const addImages = files || []; // files đã được truyền vào

    if (body.productData) {
        try {
            productData = JSON.parse(body.productData);
        } catch (err) {
            // Ném lỗi để controller có thể bắt và next()
            throw new Error("Invalid JSON format in 'productData'");
        }
    } else {
        // Nếu không có 'productData', dùng 'body' (trường hợp client gửi JSON thường)
        productData = body;
    }

    if (body.removeImages) {
        try {
            removeImages = JSON.parse(body.removeImages);
        } catch (err) {
            throw new Error("Invalid JSON format in 'removeImages'");
        }
    }
    // --- KẾT THÚC LOGIC CHUYỂN SANG ---


    // --- BƯỚC 2: LOGIC CỦA SERVICE (Giữ nguyên) ---
    const existingProduct = await productRepository.findById(id);
    if (!existingProduct) throw new Error('Product not found');

    const updatePayload = {};

    // Dùng productData đã được parse
    if (productData.name) {
        updatePayload.name = productData.name;
    }
    if (productData.description) {
        updatePayload.description = productData.description;
    }
    if (productData.isPublished !== undefined) {
        updatePayload.isPublished = productData.isPublished === 'true';
    }
    if (productData.attributes) {
        console.warn(`Attempted to update attributes on product ${id} via general update. This is not allowed.`);
    }

    let uploadedUrls = [];
    if (addImages.length > 0) {
        uploadedUrls = await uploadToS3(addImages, "productImages");
    }

    if (removeImages.length > 0) {
        await deleteFromS3(removeImages);
    }

    const finalImages = existingProduct.imageUrls
        .filter(url => !removeImages.includes(url))
        .concat(uploadedUrls);

    updatePayload.imageUrls = finalImages;

    const updatedProduct = await productRepository.update(id, updatePayload);

    return updatedProduct;
};

/**
 * Xóa sản phẩm + ảnh trên S3 + các biến thể liên quan
 */
const deleteProduct = async (id) => {
    const product = await productRepository.findById(id);
    if (!product) throw new Error("Product not found");

    // Xóa ảnh trên S3
    if (product.imageUrls?.length) {
        await deleteFromS3(product.imageUrls);
    }

    // Xóa các biến thể liên quan
    await variantRepository.deleteByProductId(id);

    // Xóa product
    await productRepository.remove(id);

    return { message: "Product deleted successfully" };
};

/**
 * Thêm ảnh mới vào product (upload lên S3)
 */
const addImagesToProduct = async (id, files) => {
    const uploadedUrls = await uploadToS3(files);

    const updated = await productRepository.update(id, {
        $push: { imageUrls: { $each: uploadedUrls } },
    });

    if (!updated) throw new Error("Product not found");
    return updated;
};

/**
 * Xóa ảnh khỏi product (xóa cả trên S3)
 */
const removeImagesFromProduct = async (id, urlsToRemove) => {
    await deleteFromS3(urlsToRemove);

    const updated = await productRepository.update(id, {
        $pull: { imageUrls: { $in: urlsToRemove } },
    });

    if (!updated) throw new Error("Product not found");
    return updated;
};

const updateProductPriceRange = async (productId) => {
    const variants = await variantRepository.find({ productId });
    if (variants.length === 0) {
        await productRepository.findByIdAndUpdate(productId, { minPrice: 0, maxPrice: 0 });
        return;
    }

    const prices = variants.map(v => v.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);

    await productRepository.findByIdAndUpdate(productId, { minPrice: min, maxPrice: max });
};

module.exports = {
    getAllProducts,
    getProductById,
    getProductBySlug,
    getProductByPrice,
    createProduct,
    updateProduct,
    deleteProduct,
    addImagesToProduct,
    removeImagesFromProduct,
    updateProductPriceRange,
};
