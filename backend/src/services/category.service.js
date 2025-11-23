const categoryRepository = require("../repositories/category.repository.js");
const productRepository = require("../repositories/product.repository.js");
const { uploadToS3, deleteFromS3 } = require("../utils/s3.helper.js");

const { default: slugify } = require("slugify");

const createCategory = async (data, imgFiles) => {
    if (!data.slug && data.name) {
        data.slug = slugify(data.name, { lower: true, strict: true });
    }

    const existing = await categoryRepository.findBySlug(data.slug);
    if (existing) {
        throw new Error("Slug already exists");
    }

    let imageUrl = null;
    if (imgFiles && imgFiles.length > 0) {
        const uploadedUrls = await uploadToS3(imgFiles, "categoryImages");
        imageUrl = uploadedUrls[0];
    }

    const categoryData = { ...data, imageUrl };

    return await categoryRepository.create(categoryData);
};

const getAllCategories = async () => {
    return await categoryRepository.findAll();
};

const getCategoryById = async (id) => {
    const category = await categoryRepository.findById(id);
    if (!category) throw new Error("Category not found");
    return category;
};

const getCategoryBySlug = async (slug) => {
    const category = await categoryRepository.findBySlug(slug);
    if (!category) throw new Error("Category not found");
    return category;
};

const updateCategory = async (id, data, imgFiles) => {
    const category = await categoryRepository.findById(id);
    if (!category) throw new Error("Category not found");

    if (data.name && !data.slug) {
        data.slug = slugify(data.name, { lower: true, strict: true });
    }

    let newImageUrl = category.imageUrl; // Mặc định giữ nguyên ảnh cũ

    // Trường hợp 1: Có upload ảnh mới (Thay thế ảnh cũ)
    if (imgFiles && imgFiles.length > 0) {
        // 1.1. Xóa ảnh cũ trên S3 nếu có
        if (category.imageUrl) {
            await deleteFromS3([category.imageUrl]); // deleteFromS3 nhận vào mảng
        }
        // 1.2. Upload ảnh mới
        const uploadedUrls = await uploadToS3(imgFiles, "categoryImages");
        newImageUrl = uploadedUrls[0];
    } 
    // Trường hợp 2: Không upload ảnh mới, nhưng muốn xóa ảnh cũ
    else if (data.deletedImages) {
        // data.deletedImages nhận từ form-data (thường là string URL)
        // Check xem url gửi lên có khớp với url trong DB không
        if (category.imageUrl && data.deletedImages.includes(category.imageUrl)) {
            await deleteFromS3([category.imageUrl]);
            newImageUrl = null;
        }
    }

    const updateData = { ...data, imageUrl: newImageUrl };

    const updated = await categoryRepository.update(id, updateData);
    return updated;
};

const deleteCategory = async (id) => {
    const { total } = await productRepository.findAll({ categoryId: id }, { limit: 1 });

    if (total > 0) {
        throw new Error(`Cannot delete category. It is in use by ${total} product(s).`);
    }

    const deleted = await categoryRepository.remove(id);
    if (!deleted) throw new Error("Category not found");
    return { message: "Category deleted successfully" };
};

module.exports = {
    createCategory,
    getAllCategories,
    getCategoryById,
    getCategoryBySlug,
    updateCategory,
    deleteCategory,
};