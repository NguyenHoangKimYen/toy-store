const categoryRepository = require("../repositories/category.repository.js");
const productRepository = require("../repositories/product.repository.js");
const { default: slugify } = require("slugify");

const createCategory = async (data) => {
    if (!data.slug && data.name) {
        data.slug = slugify(data.name, { lower: true, strict: true });
    }

    const existing = await categoryRepository.findBySlug(data.slug);
    if (existing) {
        throw new Error("Slug already exists");
    }

    return await categoryRepository.create(data);
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

const updateCategory = async (id, data) => {
    if (data.name && !data.slug) {
        data.slug = slugify(data.name, { lower: true, strict: true });
    }

    const updated = await categoryRepository.update(id, data);
    if (!updated) throw new Error("Category not found");
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