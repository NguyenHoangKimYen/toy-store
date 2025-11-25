const User = require("../models/user.model");
const CoinTransactionRepository = require("../repositories/coin-transaction.repository");
const UserVoucherLog = require("../models/user-voucher-log.model");
const DiscountCode = require("../models/discount-code.model");
const { checkAndAssignBadges } = require("../services/badge.service");

//Ưu tiên theo thứ tự từ cao xuống thấp
const TIER_RULE = [
    { tier: "diamond", min: 20_000_000 },
    { tier: "gold", min: 5_000_000 },
    { tier: "silver", min: 1_000_000 },
    { tier: "none", min: 0 },
];

//Xác định tier dựa theo tổng chi tiêu 12 tháng gần nhất
const getTierFromSpent = (spentLast12Months) => {
    for (const rule of TIER_RULE) {
        if (spentLast12Months >= rule.min) return rule.tier;
    }
    return "none";
};

//Hệ số quy đổi coin dựa theo tier
const getCoinMultiplier = (tier) => {
    switch (tier) {
        case "diamond":
            return 1.5;
        case "gold":
            return 1.0;
        case "silver":
            return 0.5;
        default:
            return 0.25; // user none vẫn được coin nhỏ
    }
};

/**
 * Xử lý khi đơn hàng hoàn thành (delivered/completed)
 * - Cập nhật chi tiêu
 * - Xác định tier
 * - Nhận coin
 * - Lưu log
 */
const handleOrderCompleted = async (userId, orderAmount, orderId) => {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    // 1. Cập nhật chi tiêu
    user.lifetimeSpent += orderAmount;
    user.spentLast12Months += orderAmount;
    user.totalOrders = (user.totalOrders || 0) + 1; // ✔ cần để xét badge đơn hàng

    // 2. Cập nhật tier
    const newTier = getTierFromSpent(user.spentLast12Months);
    user.loyaltyTier = newTier;

    // 3. Tính coin thưởng
    const multiplier = getCoinMultiplier(newTier);
    const baseCoins = Math.floor(orderAmount / 1000);
    const earnedCoins = Math.floor(baseCoins * multiplier);
    user.loyaltyPoints += earnedCoins;

    await user.save();

    // ⭐ 4. GÁN BADGE (BADGE SERVICE)
    let newBadges = [];
    const beforeBadges = user.badges.length;

    await checkAndAssignBadges(user);

    if (user.badges.length > beforeBadges) {
        // lấy badge mới nhất
        newBadges = user.badges.slice(beforeBadges);
    }

    // 5. Log coin transaction
    await CoinTransactionRepository.create({
        userId,
        type: "earn",
        amount: earnedCoins,
        balanceAfter: user.loyaltyPoints,
        orderId,
        description: `Earned coins from order ${orderId}`,
    });

    return {
        tier: user.loyaltyTier,
        earnedCoins,
        currentPoints: user.loyaltyPoints,
        newBadges, // <-- ⭐ trả về cho controller
    };
};

//Lấy thông tin loyalty của user
const getMyLoyaltyInfo = async (userId) => {
    const user = await User.findById(userId).select(
        "loyaltyTier loyaltyPoints lifetimeSpent spentLast12Months",
    );
    if (!user) throw new Error("User not found");
    return user;
};

/**
 * Lấy lịch sử coin
 */
const getMyCoinTransactions = async (userId, limit = 50) => {
    return CoinTransactionRepository.findByUser(userId, limit);
};

const MONTHLY_VOUCHERS = {
    silver: { value: 5 },
    gold: { value: 10 },
    diamond: { value: 15 },
};

async function giveMonthlyVoucher(user) {
    const tier = user.loyaltyTier;
    if (!tier || tier === "none") return null;

    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const already = await UserVoucherLog.findOne({
        userId: user._id,
        month,
        year,
        tier,
    });
    if (already) return null;

    const valueInfo = MONTHLY_VOUCHERS[tier];
    if (!valueInfo) return null;

    const code = `MB${tier.toUpperCase()}${Math.floor(10000 + Math.random() * 90000)}`;

    await DiscountCode.create({
        code,
        value: valueInfo.value,
        usageLimit: 1,
        usedCount: 0,
        requiredTier: tier,
        createdBy: user._id,
    });

    await UserVoucherLog.create({ userId: user._id, tier, month, year });

    return code;
}

module.exports = {
    handleOrderCompleted,
    getMyLoyaltyInfo,
    getMyCoinTransactions,
    getTierFromSpent,
    getCoinMultiplier,
    giveMonthlyVoucher,
};
