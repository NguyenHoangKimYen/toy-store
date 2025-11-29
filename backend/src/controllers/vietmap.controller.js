const { suggestAddress } = require("../utils/vietmap.helper.js");

// GET /api/addresses/suggest?text=76/12 Bà Hom
const getAddressSuggestions = async (req, res, next) => {
    try {
        let { text } = req.query;

        // Chuẩn hóa input
        if (!text || typeof text !== "string") {
            return res.status(400).json({
                success: false,
                message: "Missing address text parameter",
            });
        }

        text = text.trim();
        if (text.length < 2) {
            return res.status(400).json({
                success: false,
                message: "Please enter at least 2 characters to search address",
            });
        }

        // Gọi helper VietMap
        const suggestions = await suggestAddress(text);

        return res.json({
            success: true,
            data: suggestions,
        });
    } catch (error) {
        console.error("getAddressSuggestions error:", error.message);
        next(error);
    }
};

module.exports = { getAddressSuggestions };
