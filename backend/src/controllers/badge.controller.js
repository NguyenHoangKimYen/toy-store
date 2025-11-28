const Badge = require("../models/badge.model");
const User = require("../models/user.model");

module.exports = {
    async createBadge(req, res) {
        try {
            const badge = await Badge.create(req.body);
            return res.json({ success: true, badge });
        } catch (err) {
            return res
                .status(400)
                .json({ success: false, message: err.message });
        }
    },

    async updateBadge(req, res) {
        try {
            const badge = await Badge.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true },
            );
            if (!badge)
                return res
                    .status(404)
                    .json({ success: false, message: "Badge not found" });

            return res.json({ success: true, badge });
        } catch (err) {
            return res
                .status(400)
                .json({ success: false, message: err.message });
        }
    },

    async deleteBadge(req, res) {
        try {
            const badge = await Badge.findByIdAndDelete(req.params.id);
            if (!badge)
                return res
                    .status(404)
                    .json({ success: false, message: "Badge not found" });

            return res.json({ success: true, badge });
        } catch (err) {
            return res
                .status(400)
                .json({ success: false, message: err.message });
        }
    },

    async getAll(req, res) {
        const badges = await Badge.find().sort({ threshold: 1 });
        return res.json({ success: true, badges });
    },

    async getMyBadges(req, res) {
        try {
            const user = await User.findById(req.user.id).populate(
                "badges.badgeId",
            );
            if (!user)
                return res
                    .status(404)
                    .json({ success: false, message: "User not found" });

            const badges = (user.badges || []).map((b) => ({
                badgeId: b.badgeId?._id || b.badgeId,
                name: b.badgeId?.name,
                description: b.badgeId?.description,
                icon: b.badgeId?.icon,
                type: b.badgeId?.type,
                threshold: b.badgeId?.threshold,
                receivedAt: b.receivedAt,
            }));

            return res.json({ success: true, badges });
        } catch (err) {
            return res
                .status(400)
                .json({ success: false, message: err.message });
        }
    },
};
