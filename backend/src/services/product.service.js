const productRepository = require("../repositories/product.repository.js");
const variantRepository = require("../repositories/variant.repository.js");
const { uploadToS3, deleteFromS3 } = require("../utils/s3.helper.js");
const { default: slugify } = require("slugify");

/**
 * Lấy danh sách sản phẩm (có lọc + phân trang)
 */
/**
 * Lấy danh sách sản phẩm (có lọc + phân trang)
 */
const getAllProducts = async (query) => {
    // 1. Phân tích các tham số (params) từ query
    const params = new URLSearchParams(Object.entries(query || {}));

    // Phân trang
    const page = Math.max(1, parseInt(params.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(params.get("limit") || "20", 10));
    
    // Sắp xếp
    const sortParam = params.get("sort") || null; // Ví dụ: "minPrice:asc", "totalUnitsSold:desc"

    // 2. Xây dựng đối tượng 'filter' (bộ lọc)
    const filter = {};

    // --- Lọc theo Keyword (cho name và slug) ---
    const keyword = params.get("keyword") || null;
    if (keyword) {
        filter.$or = [
            { name: { $regex: keyword, $options: "i" } },
            { slug: { $regex: keyword, $options: "i" } }
        ];
    }

    // --- Lọc theo Category ---
    const categoryId = params.get("categoryId") || null;
    if (categoryId) {
        // Model của bạn dùng mảng categoryId, nên ta tìm sản phẩm
        // có chứa categoryId này trong mảng của nó
        filter.categoryId = categoryId;
    }

    // --- Lọc theo Khoảng giá (Price Range) ---
    // Logic: (Product.minPrice <= Filter.maxPrice) AND (Product.maxPrice >= Filter.minPrice)
    // Điều này tìm các sản phẩm có dải giá *chồng lấn* với dải giá người dùng tìm.
    const minPrice = parseFloat(params.get("minPrice") || "0");
    const maxPrice = parseFloat(params.get("maxPrice") || "0");
    
    if (minPrice > 0) {
        filter.maxPrice = { $gte: minPrice };
    }
    if (maxPrice > 0) {
        // Nối vào điều kiện minPrice nếu có
        filter.minPrice = { ...filter.minPrice, $lte: maxPrice };
    }

    // --- Lọc theo Đánh giá (Rating) ---
    const minRating = parseFloat(params.get("minRating") || "0");
    if (minRating > 0) {
        filter.averageRating = { $gte: minRating };
    }

    // --- Lọc theo Nổi bật (Featured) ---
    if (params.get("isFeatured") === 'true') {
        filter.isFeatured = true;
    }

    // 3. Xây dựng đối tượng 'options' (phân trang & sắp xếp)
    const options = {
        skip: (page - 1) * limit,
        limit,
        sort: {},
    };

    // Logic sắp xếp (Đã sửa lỗi, giờ hỗ trợ cả 'asc' và 'desc')
    const defaultSort = { createdAt: -1 }; // Mặc định là sản phẩm mới nhất
    if (sortParam) {
        const [key, order] = sortParam.split(":");
        options.sort[key] = order === "desc" ? -1 : 1;
    } else {
        options.sort = defaultSort;
    }

    // 4. Gọi Repository
    const { products, total } = await productRepository.findAll(filter, options);

    // 5. Trả về kết quả
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

    if (!productData.name) {
        throw new Error("Product name is required.");
    }
    
    const slugToCreate = productData.slug 
        ? slugify(productData.slug, { lower: true, strict: true })
        : slugify(productData.name, { lower: true, strict: true });

    const existingProduct = await productRepository.findBySlug(slugToCreate);
    if (existingProduct) {
        throw new Error(`Slug '${slugToCreate}' already exists. Please use a different name or provide a unique slug.`);
    }
    
    let imageUrls = [];

    if (imgFiles && imgFiles.length > 0) {
        imageUrls = await uploadToS3(imgFiles, "productImages");
    }

    const product = {
        ...productData,
        slug: slugToCreate,
        imageUrls: imageUrls,
    };
    
    delete product.attributes;

    return await productRepository.create(product);
};

/**
 * Xóa sản phẩm + ảnh trên S3 + các biến thể liên quan
 */
const deleteProduct = async (id) => {
    const product = await productRepository.findById(id);
    if (!product) throw new Error("Product not found");

    if (product.imageUrls?.length) {
        await deleteFromS3(product.imageUrls);
    }

    await variantRepository.deleteByProductId(id);

    await productRepository.remove(id);

    return { message: "Product deleted successfully" };
};

/**
 * Cập nhật thông tin sản phẩm (chỉ các trường được phép trong whitelist)
 */
const updateProduct = async (id, updateData) => {
    
    const existingProduct = await productRepository.findById(id);
    if (!existingProduct) throw new Error('Product not found');

    const validStatuses = ["Draft", "Published", "Archived", "Disabled"];

    const allowedUpdates = [
        'name',
        'slug',
        'description',
        'status',
        'isFeatured',
        'categoryId'
    ];

    const updatePayload = {};

    Object.keys(updateData).forEach(key => {
        if (allowedUpdates.includes(key)) {
            
            const value = updateData[key];

            if (value !== undefined) {
                
                if (key === 'status') {
                    if (!validStatuses.includes(value)) {
                        throw new Error(
                            `Invalid status: '${value}'. Must be one of: ${validStatuses.join(', ')}`
                        );
                    }
                }

                updatePayload[key] = value;
            }
        }
    });

    if (updateData.attributes || updateData.variants || updateData.imageUrls) {
        console.warn(`[WARN] Attempted to update restricted fields (attributes, variants, imageUrls) on product ${id}. These fields must be updated via their dedicated endpoints.`);
    }

    const updatedProduct = await productRepository.update(id, updatePayload);
    return updatedProduct;
};

/**
 * Thêm ảnh mới vào product (upload lên S3)
 */
const addImagesToProduct = async (id, files) => {
    const uploadedUrls = await uploadToS3(files, "productImages");

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

// Hàm tự động cập nhật giá
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