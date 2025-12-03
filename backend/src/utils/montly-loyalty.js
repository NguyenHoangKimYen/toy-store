const User = require('../models/user.model');
const { giveMonthlyVoucher } = require('../services/loyalty.service');

module.exports = async function giveMonthlyLoyaltyRewards() {
    const users = await User.find({ loyaltyRank: { $ne: 'none' } });

    for (const u of users) {
        await giveMonthlyVoucher(u);
    }
};
