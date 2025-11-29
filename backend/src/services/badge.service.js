const Badge = require('../models/badge.model');
const User = require('../models/user.model');

async function checkAndAssignBadges(user) {
    const badges = await Badge.find();
    const unlocked = [];

    for (const badge of badges) {
        let achieved = false;

        switch (badge.type) {
            case 'spent':
                achieved = user.lifetimeSpent >= badge.threshold;
                break;

            case 'orders':
                achieved = (user.totalOrders || 0) >= badge.threshold;
                break;
        }

        if (achieved) {
            const already = user.badges.some(
                (b) => b.badgeId.toString() === badge._id.toString(),
            );

            if (!already) {
                user.badges.push({
                    badgeId: badge._id,
                    receivedAt: new Date(),
                });

                // Badge mới unlock → push vào list
                unlocked.push({
                    id: badge._id,
                    name: badge.name,
                    icon: badge.icon,
                    description: badge.description,
                });
            }
        }
    }

    await user.save();
    return unlocked; // ⭐ trả về danh sách badge mới mở khóa
}

module.exports = { checkAndAssignBadges };
