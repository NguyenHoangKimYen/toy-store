const variantRepository = require("../repositories/variant.repository");
const productRepository = require("../repositories/product.repository");
const { uploadToS3, deleteFromS3 } = require("../utils/s3.helper");

const updateProductPriceRange = async (productId) => {
    const variants = await variantRepository.findByProductId(productId);

    if (!variants.length) {
        await productRepository.updatePriceRange(productId, 0, 0);
        return;
    }

    const prices = variants.map(v => v.price || 0);
    const min = Math.min(...prices);
    const max = Math.max(...prices);

    await productRepository.updatePriceRange(productId, min, max);
};

/** Lấy danh sách variant theo product */
const getVariantsByProduct = async (productId) => {
    return await variantRepository.findByProductId(productId);
};

const getVariantById = async (id) => {
    const variant = await variantRepository.findById(id);
    if (!variant) {
        throw new Error("Variant not found");
    }
    return variant;
};

/** Tạo một biến thể mới và đảm bảo tính toàn vẹn dữ liệu */
const createVariant = async (productId, variantData, imgFiles) => {
    const product = await productRepository.findById(productId);
    if (!product) {
        throw new Error("Product not found");
    }

    const allowedAttributes = product.attributes;

    let variantAttributesArray;
    if (typeof variantData.attributes === 'string') {
        try {
            variantAttributesArray = JSON.parse(variantData.attributes);
        } catch (e) {
            throw new Error("Invalid attributes JSON format. Please send an array.");
        }
    } else {
        variantAttributesArray = variantData.attributes;
    }

    for (const variantAttr of variantAttributesArray) {
        const definition = allowedAttributes.find(
            (attr) => attr.name === variantAttr.name
        );
        
        if (!definition) {
            allowedAttributes.push({
                name: variantAttr.name,
                values: [variantAttr.value]
            });
            
        } else {
            if (!definition.values.includes(variantAttr.value)) {
                definition.values.push(variantAttr.value);
            }
        }
    }

    let imageUrls = [];
    if (imgFiles && imgFiles.length > 0) {
        imageUrls = await uploadToS3(imgFiles, "variantImages");
    }
    
    const newVariant = {
        ...variantData,
        attributes: variantAttributesArray, 
        imageUrls: imageUrls,
        productId: productId
    }
    
    const createdVariant = await variantRepository.create(newVariant);
    
    product.variants.push(createdVariant._id);
    
    await product.save();

    await updateProductPriceRange(productId);

    return createdVariant;
};

/** Cập nhật variant */
const updateVariant = async (id, data) => {
    const updated = await variantRepository.update(id, data);
    if (!updated) throw new Error("Variant not found");

    await updateProductPriceRange(updated.productId);
    return updated;
};

/** Xóa variant và cập nhật lại product */
const deleteVariant = async (id) => {
    const variant = await variantRepository.findById(id);
    if (!variant) throw new Error("Variant not found");

    // Xóa ảnh S3 nếu có
    if (variant.imageUrls?.length) {
        await deleteFromS3(variant.imageUrls);
    }

    await variantRepository.deleteById(id);

    await productRepository.update(variant.productId, {
        $pull: { variants: variant._id },
    });

    await updateProductPriceRange(variant.productId);

    return { message: "Variant deleted successfully" };
};



/** Thêm ảnh mới cho variant */
const addVariantImages = async (id, files) => {
    const uploadedUrls = await uploadToS3(files, "variantImages");

    const updated = await variantRepository.update(id, {
        $push: { imageUrls: { $each: uploadedUrls } },
    });

    if (!updated) throw new Error("Variant not found");
    return updated;
};

/** Xóa ảnh khỏi variant */
const removeVariantImages = async (id, urlsToRemove) => {
    await deleteFromS3(urlsToRemove);

    const updated = await variantRepository.update(id, {
        $pull: { imageUrls: { $in: urlsToRemove } },
    });

    if (!updated) throw new Error("Variant not found");
    return updated;
};

module.exports = {
    getVariantsByProduct,
    getVariantById,
    createVariant,
    updateVariant,
    deleteVariant,
    addVariantImages,
    removeVariantImages,
};