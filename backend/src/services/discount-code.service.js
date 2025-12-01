const discountRepo = require('../repositories/discount-code.repository');
const DiscountCode = require('../models/discount-code.model');
const User = require('../models/user.model');

function isTierEligible(userTier, requiredTier) {
    const order = ['none', 'silver', 'gold', 'diamond'];
    return order.indexOf(userTier) >= order.indexOf(requiredTier);
}

module.exports = {
    async createDiscountCode(data) {
        const payload = {
            ...data,
            code: data.code?.toUpperCase().trim(),
        };

        if (!payload.createdBy) {
            throw new Error("createdBy is required");
        }

        return DiscountCode.create(payload);
    },

    async updateDiscountCode(id, data) {
        const payload = { ...data };
        if (payload.code) payload.code = payload.code.toUpperCase().trim();
        return DiscountCode.findByIdAndUpdate(id, payload, { new: true });
    },

    async deleteDiscountCode(id) {
        return DiscountCode.findByIdAndDelete(id);
    },

    async getAll(params = {}) {
        const { search, sortBy } = params;
        const query = {};
        
        // Add search filter if provided
        if (search && search.trim()) {
            const searchRegex = new RegExp(search.trim(), 'i');
            query.code = { $regex: searchRegex };
        }
        
        // Build sort object based on sortBy parameter
        let sortOptions = { createdAt: -1 }; // Default: newest first
        if (sortBy) {
            switch (sortBy) {
                case 'newest':
                    sortOptions = { createdAt: -1 };
                    break;
                case 'oldest':
                    sortOptions = { createdAt: 1 };
                    break;
                case 'usage-high':
                    sortOptions = { usedCount: -1 };
                    break;
                case 'usage-low':
                    sortOptions = { usedCount: 1 };
                    break;
                default:
                    sortOptions = { createdAt: -1 };
            }
        }
        
        return DiscountCode.find(query).sort(sortOptions);
    },

    async validateAndApply({ userId, discountCodeId, orderAmount }) {
        const code = await discountRepo.findById(discountCodeId);
        if (!code) throw new Error('DISCOUNT_NOT_FOUND');

        // Check expired
        if (code.expiresAt && code.expiresAt < new Date()) {
            throw new Error('DISCOUNT_EXPIRED');
        }

        // Check usage limit
        if (code.usedCount >= code.usageLimit) {
            throw new Error('DISCOUNT_USAGE_LIMIT');
        }

        // Check tier restriction
        if (userId) {
            const user = await User.findById(userId).select('loyaltyRank');
            const userTier = user?.loyaltyRank || 'none';

            if (!isTierEligible(userTier, code.requiredTier)) {
                throw new Error('DISCOUNT_TIER_NOT_ELIGIBLE');
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

    async validateByCode({ code, totalAmount, userId }) {
        if (!code) throw new Error("DISCOUNT_CODE_REQUIRED");
        const doc = await discountRepo.findByCode(code);
        if (!doc) throw new Error("DISCOUNT_NOT_FOUND");

        // Check expired
        if (doc.expiresAt && doc.expiresAt < new Date()) {
            throw new Error("DISCOUNT_EXPIRED");
        }

        // Check usage limit
        if (doc.usedCount >= doc.usageLimit) {
            throw new Error("DISCOUNT_USAGE_LIMIT");
        }

        // Check tier restriction
        if (userId) {
            const user = await User.findById(userId).select("loyaltyRank");
            const userTier = user?.loyaltyRank || "none";

            if (!isTierEligible(userTier, doc.requiredTier)) {
                throw new Error("DISCOUNT_TIER_NOT_ELIGIBLE");
            }
        }

        const discountValue = Number(doc.value);
        const finalAmount = Math.max(Number(totalAmount) - discountValue, 0);

        return {
            discountCodeId: doc._id,
            discountValue,
            finalAmount,
            requiredTier: doc.requiredTier,
            usageLeft: Math.max(doc.usageLimit - doc.usedCount, 0),
        };
    },

    async markUsed(discountCodeId) {
        await discountRepo.increaseUsedCount(discountCodeId);
    },

    async decrementUsedCount(discountCodeId) {
        await discountRepo.decreaseUsedCount(discountCodeId);
    },

    async checkUsageLimit(discountCodeId) {
        const code = await discountRepo.findById(discountCodeId);
        if (!code) return false;
        
        // Check if code has remaining usage
        return code.usedCount < code.usageLimit;
    },
};
