const mongoose = require('mongoose');
const productRepository = require('../repositories/product.repository.js');
const variantRepository = require('../repositories/variant.repository.js');
const { uploadToS3, deleteFromS3 } = require('../utils/s3.helper.js');
const { default: slugify } = require('slugify');

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
    const page = Math.max(1, parseInt(params.get('page') || '1', 10));
    const limit = Math.max(1, parseInt(params.get('limit') || '20', 10));

    // Sắp xếp
    const sortParam = params.get('sort') || null;

    // 2. Xây dựng đối tượng 'filter' (bộ lọc)
    const filter = {};

    // --- Lọc theo Keyword (cho name và slug) ---
    const keyword = params.get('keyword') || null;
    if (keyword) {
        filter.$or = [
            { name: { $regex: keyword, $options: 'i' } },
            { slug: { $regex: keyword, $options: 'i' } },
        ];
    }

    // --- Lọc theo Category ---
    const categoryId = params.get('categoryId') || null;
    if (categoryId) {
        filter.categoryId = categoryId;
    }

    // --- Lọc theo Khoảng giá (Price Range) ---
    const minPrice = parseFloat(params.get('minPrice') || '0');
    const maxPrice = parseFloat(params.get('maxPrice') || '0');

    if (minPrice > 0) {
        filter.maxPrice = { $gte: minPrice };
    }
    if (maxPrice > 0) {
        filter.minPrice = { ...filter.minPrice, $lte: maxPrice };
    }

    // --- Lọc theo Đánh giá (Rating) ---
    const minRating = parseFloat(params.get('minRating') || '0');
    if (minRating > 0) {
        filter.averageRating = { $gte: minRating };
    }

    // --- Lọc theo Nổi bật (Featured) ---
    if (params.get('isFeatured') === 'true') {
        filter.isFeatured = true;
    }

    // ================================================================
    // --- [MỚI] Lọc theo Ngày tạo (Date Range) ---
    // ================================================================

    // (Lưu ý: filter.createdAt có thể được xây dựng từng phần)
    filter.createdAt = {};

    // Lọc theo 'daysAgo' (ví dụ: ?daysAgo=7)
    // Ưu tiên hơn startDate nếu cả hai đều được cung cấp
    const daysAgo = parseInt(params.get('daysAgo') || '0', 10);
    if (daysAgo > 0) {
        const pastDate = new Date();
        pastDate.setDate(new Date().getDate() - daysAgo);
        pastDate.setHours(0, 0, 0, 0); // Đặt về đầu ngày

        filter.createdAt.$gte = pastDate;
    } else {
        // Nếu không có daysAgo, kiểm tra startDate
        const startDate = params.get('startDate') || null; // Dạng "YYYY-MM-DD"
        if (startDate) {
            // $gte: Lớn hơn hoặc bằng (từ 00:00:00 của ngày bắt đầu)
            filter.createdAt.$gte = new Date(startDate);
        }
    }

    // Lọc theo endDate (ví dụ: ?endDate=2025-11-15)
    const endDate = params.get('endDate') || null; // Dạng "YYYY-MM-DD"
    if (endDate) {
        // $lte: Nhỏ hơn hoặc bằng (đến 23:59:59 của ngày kết thúc)
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);

        filter.createdAt.$lte = endOfDay;
    }

    // Nếu không có điều kiện ngày nào được thêm, xóa object rỗng
    if (Object.keys(filter.createdAt).length === 0) {
        delete filter.createdAt;
    }

    // ================================================================
    // --- Kết thúc phần lọc ngày ---
    // ================================================================

    // 3. Xây dựng đối tượng 'options' (phân trang & sắp xếp)
    const options = {
        skip: (page - 1) * limit,
        limit,
        sort: {},
    };

    const defaultSort = { createdAt: -1 };
    if (sortParam) {
        const [key, order] = sortParam.split(':');
        options.sort[key] = order === 'desc' ? -1 : 1;
    } else {
        options.sort = defaultSort;
    }

    // 4. Gọi Repository
    const { products, total } = await productRepository.findAll(
        filter,
        options,
    );

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
    if (!product) throw new Error('Product not found');
    return product;
};

const getProductBySlug = async (slug) => {
    const product = await productRepository.findBySlug(slug);
    if (!product) {
        throw new Error("Product not found");
    }
    return product;
};

const getProductByPrice = (min, max) => {
    return productRepository.findByPrice(min, max);
};

const createProduct = async (productData, imgFiles) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 1. Validate cơ bản
        if (!productData.name) {
            throw new Error('Product name is required.');
        }

        // 2. Tạo Slug
        const slugToCreate = productData.slug
            ? slugify(productData.slug, { lower: true, strict: true })
            : slugify(productData.name, { lower: true, strict: true });

        const existingProduct =
            await productRepository.findBySlug(slugToCreate);
        if (existingProduct) {
            throw new Error(`Slug '${slugToCreate}' already exists.`);
        }

        // 3. Upload ảnh chính của Product (nếu có)
        let imageUrls = [];
        if (imgFiles && imgFiles.length > 0) {
            imageUrls = await uploadToS3(imgFiles, 'productImages');
        }

        // 4. Parse dữ liệu Variants
        // Khi gửi multipart/form-data, mảng object thường bị chuyển thành chuỗi JSON
        let variantsInput = [];
        if (productData.variants) {
            try {
                variantsInput =
                    typeof productData.variants === 'string'
                        ? JSON.parse(productData.variants)
                        : productData.variants;
            } catch (e) {
                throw new Error(
                    'Invalid variants data format. Must be a valid JSON array.',
                );
            }
        }

        // 5. Tạo Product Document (Tạm thời rỗng variants/attributes)
        // Lưu ý: Cần truyền session vào repository
        const newProduct = await productRepository.create(
            {
                ...productData,
                slug: slugToCreate,
                imageUrls: imageUrls,
                variants: [],
                attributes: [],
                minPrice: 0,
                maxPrice: 0,
            },
            { session },
        ); // Quan trọng: Truyền session
        const newProduct = await productRepository.create(
            {
                ...productData,
                slug: slugToCreate,
                imageUrls: imageUrls,
                variants: [],
                attributes: [],
                minPrice: 0,
                maxPrice: 0,
            },
            { session },
        ); // Quan trọng: Truyền session

        // 6. Xử lý Variants & Attributes
        let createdVariantIds = [];
        let allAttributes = [];
        let minPrice = 0;
        let maxPrice = 0;

        if (variantsInput.length > 0) {
            const variantDocs = [];
            const prices = [];

            for (const v of variantsInput) {
                // a. Xử lý Attributes cho từng variant
                const attrs = v.attributes || [];

                // b. Gộp vào danh sách Attributes tổng của Product
                attrs.forEach((attr) => {
                    const existing = allAttributes.find(
                        (a) => a.name === attr.name,
                    );
                    if (existing) {
                        if (!existing.values.includes(attr.value)) {
                            existing.values.push(attr.value);
                        }
                    } else {
                        allAttributes.push({
                            name: attr.name,
                            values: [attr.value],
                        });
                    }
                });

                // c. Chuẩn bị object Variant
                variantDocs.push({
                    productId: newProduct._id,
                    name:
                        v.name ||
                        `${productData.name} - ${attrs.map((a) => a.value).join(' ')}`,
                    sku: v.sku,
                    weight: parseInt(v.weight || 100),
                    price: parseFloat(v.price || 0),
                    stock: parseInt(v.stock || 0),
                    attributes: attrs,
                    imageUrls: [], // Chưa có ảnh
                    imageUrls: [], // Chưa có ảnh
                });

                prices.push(parseFloat(v.price || 0));
            }

            // d. Lưu Variants vào DB (Batch Insert)
            // Lưu ý: Repository cần hỗ trợ insertMany hoặc tạo vòng lặp create với session
            // Giả sử variantRepository.createMany hỗ trợ session
            const createdVariants = await variantRepository.createMany(
                variantDocs,
                {
                    session,
                },
            );

            createdVariantIds = createdVariants.map((v) => v._id);

            // e. Tính giá (totalStock sẽ được tự động cập nhật bởi variant middleware)
            if (prices.length > 0) {
                minPrice = Math.min(...prices);
                maxPrice = Math.max(...prices);
            }
        }

        // 7. Cập nhật lại Product với thông tin variants vừa tạo
        // Dùng findByIdAndUpdate hoặc update của repo, nhớ truyền session
        await productRepository.update(
            newProduct._id,
            {
                variants: createdVariantIds,
                attributes: allAttributes,
                minPrice,
                maxPrice,
            },
            { session },
        );

        // Recalculate totalStock within transaction (insertMany doesn't trigger save middleware)
        const Variant = require("../models/variant.model");
        await Variant.recalculateProductData(newProduct._id);

        // 8. Commit Transaction (Lưu tất cả)
        await session.commitTransaction();

        // Trả về sản phẩm hoàn chỉnh
        // Có thể cần gọi lại getById để lấy data đầy đủ populate
        return await productRepository.findById(newProduct._id);
    } catch (error) {
        // 9. Rollback (Hủy tất cả thao tác DB)
        await session.abortTransaction();

        // Nếu đã lỡ upload ảnh lên S3 thì xóa đi (dọn rác)
        // (Bạn cần implement logic lấy array url vừa upload để xóa tại đây)

        throw error;
    } finally {
        session.endSession();
    }
};

const deleteProduct = async (id) => {
    const product = await productRepository.findById(id);
    if (!product) throw new Error('Product not found');

    if (product.imageUrls?.length) {
        await deleteFromS3(product.imageUrls);
    }

    // Delete all variants (deleteMany doesn't trigger middleware per document)
    await variantRepository.deleteByProductId(id);

    // Delete the product itself
    await productRepository.remove(id);

    return { message: 'Product deleted successfully' };
};

/**
 * Cập nhật thông tin sản phẩm (chỉ các trường được phép trong whitelist)
 */
const updateProduct = async (id, updateData) => {
    const existingProduct = await productRepository.findById(id);
    if (!existingProduct) throw new Error("Product not found");

    const validStatuses = ['Draft', 'Published', 'Archived', 'Disabled'];

    const allowedUpdates = [
        'name',
        'slug',
        'description',
        'status',
        'isFeatured',
        'categoryId',
    ];

    const updatePayload = {};

    Object.keys(updateData).forEach((key) => {
        if (allowedUpdates.includes(key)) {
            const value = updateData[key];

            if (value !== undefined) {
                if (key === 'status') {
                    if (!validStatuses.includes(value)) {
                        throw new Error(
                            `Invalid status: '${value}'. Must be one of: ${validStatuses.join(', ')}`,
                        );
                    }
                }

                updatePayload[key] = value;
            }
        }
    });

    if (updateData.attributes || updateData.variants || updateData.imageUrls) {
        console.warn(
            `[WARN] Attempted to update restricted fields (attributes, variants, imageUrls) on product ${id}. These fields must be updated via their dedicated endpoints.`,
        );
    }

    const updatedProduct = await productRepository.update(id, updatePayload);
    return updatedProduct;
};

/**
 * Thêm ảnh mới vào product (upload lên S3)
 */
const addImagesToProduct = async (id, files) => {
    const uploadedUrls = await uploadToS3(files, 'productImages');

    const updated = await productRepository.update(id, {
        $push: { imageUrls: { $each: uploadedUrls } },
    });

    if (!updated) throw new Error('Product not found');
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

    if (!updated) throw new Error('Product not found');
    return updated;
};

// Hàm tự động cập nhật giá
const updateProductPriceRange = async (productId) => {
    const variants = await variantRepository.find({ productId });
    if (variants.length === 0) {
        await productRepository.findByIdAndUpdate(productId, {
            minPrice: 0,
            maxPrice: 0,
        });
        return;
    }

    const prices = variants.map((v) => v.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);

    await productRepository.findByIdAndUpdate(productId, {
        minPrice: min,
        maxPrice: max,
    });
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
