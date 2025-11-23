const discountRepo = require("../repositories/discount-code.repository");
const DiscountCode = require("../models/discount-code.model");
const User = require("../models/user.model");

function isTierEligible(userTier, requiredTier) {
    const order = ["none", "silver", "gold", "diamond"];
    return order.indexOf(userTier) >= order.indexOf(requiredTier);
}

module.exports = {
    async validateAndApply({ userId, discountCodeId, orderAmount }) {
        const code = await discountRepo.findById(discountCodeId);
        if (!code) throw new Error("DISCOUNT_NOT_FOUND");

        // Check expired
        if (code.expiresAt && code.expiresAt < new Date()) {
            throw new Error("DISCOUNT_EXPIRED");
        }

        // Check usage limit
        if (code.usedCount >= code.usageLimit) {
            throw new Error("DISCOUNT_USAGE_LIMIT");
        }

        // Check tier restriction
        if (userId) {
            const user = await User.findById(userId).select("loyaltyTier");
            const userTier = user?.loyaltyTier || "none";

            if (!isTierEligible(userTier, code.requiredTier)) {
                throw new Error("DISCOUNT_TIER_NOT_ELIGIBLE");
            }
        }

        // Tính số tiền giảm
        const discountValue = Number(code.value); // Decimal128 → number
        const finalAmount = Math.max(orderAmount - discountValue, 0);

        return {
            discountValue,
            finalAmount,
        };
    },

    async markUsed(discountCodeId) {
        await discountRepo.increaseUsedCount(discountCodeId);
    },
};
