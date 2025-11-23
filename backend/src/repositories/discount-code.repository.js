const DiscountCode = require("../models/discount-code.model");

const findById = (id) => {
    return DiscountCode.findById(id);
};

const increaseUsedCount = async (id) => {
    return DiscountCode.findByIdAndUpdate(
        id,
        { $inc: { usedCount: 1 } },
        { new: true },
    );
};

module.exports = {
    findById,
    increaseUsedCount,
};
