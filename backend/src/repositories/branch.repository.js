const Order = require("../models/order.model");
const branches = require("../data/branches");

// Helper: so sánh city/province không phân biệt hoa thường, bỏ dấu cách thừa
const normalize = (s = "") => s.trim().toLowerCase();

module.exports = {
    async getBranchesWithOrderStats() {
        // Đếm số đơn theo city của địa chỉ giao hàng
        const orderStats = await Order.aggregate([
            {
                $match: {
                    status: { $nin: ["cancelled", "returned"] },
                    paymentStatus: { $ne: "failed" },
                },
            },
            {
                $lookup: {
                    from: "addresses",
                    localField: "addressId",
                    foreignField: "_id",
                    as: "address",
                },
            },
            { $unwind: { path: "$address", preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: { $ifNull: ["$address.city", "unknown"] },
                    orderCount: { $sum: 1 },
                },
            },
        ]);

        // Map city -> count để tra nhanh
        const cityCount = new Map(
            orderStats.map((s) => [normalize(s._id), s.orderCount]),
        );

        return branches.map((branch) => {
            const key = normalize(branch.province);
            const orderCount = cityCount.get(key) || 0;

            return {
                code: branch.code,
                name: branch.name,
                province: branch.province,
                lat: branch.lat,
                lng: branch.lng,
                orderCount,
                weight: orderCount ? Math.max(orderCount / 200, 0.05) : 0,
            };
        });
    },
};
