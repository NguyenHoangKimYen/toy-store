const DiscountCode = require("../models/discount-code.model");

const findById = (id) => {
    return DiscountCode.findById(id);
};

const findByCode = (code) => {
  return DiscountCode.findOne({ code: code.toUpperCase().trim() });
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
  findByCode,
  increaseUsedCount,
};
