const variantService = require("../services/variant.service");
const { mongo } = require("mongoose");

/** Lấy danh sách variant theo product */
const getVariantsByProduct = async (req, res, next) => {
    try {
        const variants = await variantService.getVariantsByProduct(req.params.productId);
        res.json({ success: true, data: variants });
    } catch (err) {
        next(err);
    }
};

const getVariantById = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongo.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid ID format" });
        }

        const variant = await variantService.getVariantById(id);
    
        res.json({ success: true, data: variant });
    } catch (err) {
        next(err);
    }
};

const createVariant = async (req, res, next) => {
    try {
        const { productId } = req.params; 

        const variantData = req.body; 

        const imgFiles = req.files;

        const newVariant = await variantService.createVariant(
            productId,
            variantData, 
            imgFiles
        );

        res.json({ success: true, data: newVariant });
    } catch (error) {
        next(error);
    }
};

const updateVariant = async (req, res, next) => {
    try {
        const variant = await variantService.updateVariant(req.params.id, req.body);
        res.json({ success: true, data: variant });
    } catch (err) {
        next(err);
    }
};

/** Xóa variant */
const deleteVariant = async (req, res, next) => {
    try {
        const result = await variantService.deleteVariant(req.params.id);
        res.json({ success: true, message: result.message });
    } catch (err) {
        next(err);
    }
};

/** Thêm ảnh */
const addVariantImages = async (req, res, next) => {
    try {
        const { id } = req.params;
        const files = req.files;
        if (!files?.length)
            return res.status(400).json({ message: "No files uploaded" });

        const updated = await variantService.addVariantImages(id, files);
        res.json({ success: true, data: updated });
    } catch (err) {
        next(err);
    }
};

/** Xóa ảnh */
const removeVariantImages = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { removeImages } = req.body;
        if (!Array.isArray(removeImages) || !removeImages.length)
            return res.status(400).json({ message: "No image URLs provided" });

        const updated = await variantService.removeVariantImages(id, removeImages);
        res.json({ success: true, data: updated });
    } catch (err) {
        next(err);
    }
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