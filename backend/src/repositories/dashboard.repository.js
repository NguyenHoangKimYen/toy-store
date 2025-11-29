const Order = require("../models/order.model");
const User = require("../models/user.model");

// Normalize all legacy COD method values so analytics stay correct
const COD_METHODS = ["cashondelivery", "cod", "cashOnDelivery", "cash"];

module.exports = {
    // 1. Tổng doanh thu (status = PAID)
    async getTotalRevenue() {
        const r = await Order.aggregate([
            { $match: { paymentStatus: "paid" } },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ]);
        return r[0]?.total || 0;
    },

    // 2. Doanh thu theo kênh (website/mobile/cod/e-wallet)
    async getRevenueByChannel() {
        const raw = await Order.aggregate([
            {
                $match: {
                    $or: [
                        // Tất cả đơn đã paid (mọi cổng)
                        { paymentStatus: "paid" },
                        // COD chỉ tính khi đã giao xong (đảm bảo đã thu tiền)
                        {
                            paymentMethod: { $in: COD_METHODS },
                            status: { $in: ["delivered", "completed"] },
                            paymentStatus: { $ne: "failed" },
                        },
                    ],
                },
            },
            {
                $group: {
                    _id: "$paymentMethod",
                    total: { $sum: "$totalAmount" },
                },
            },
        ]);

        const codTotal = raw
            .filter((x) => COD_METHODS.includes(x._id))
            .reduce((sum, x) => sum + x.total, 0);

        const codTotal = raw
            .filter((x) => COD_METHODS.includes(x._id))
            .reduce((sum, x) => sum + x.total, 0);

        return {
            website: raw.find((x) => x._id === "website")?.total || 0,
            mobile: raw.find((x) => x._id === "mobile")?.total || 0,
            cod: codTotal,
            ewallet: raw
                .filter((x) => ["momo", "vnpay", "zalopay"].includes(x._id))
                .reduce((s, x) => s + x.total, 0),
        };
    },

    // 3. User Segmentation (Pie chart)
    async getUserSegmentation() {
        const users = await User.aggregate([
            {
                $lookup: {
                    from: "orders",
                    localField: "_id",
                    foreignField: "userId",
                    as: "orders",
                },
            },
            {
                $project: {
                    totalSpend: { $sum: "$orders.totalAmount" },
                },
            },
        ]);

        let high = 0,
            medium = 0,
            low = 0;

        users.forEach((u) => {
            if (!u.totalSpend || u.totalSpend < 1000000) low++;
            else if (u.totalSpend < 4000000) medium++;
            else high++;
        });

        return { high, medium, low, totalUsers: users.length };
    },

    // 4. Revenue last 7 days (Bar chart)
    async getLast7DaysRevenue() {
        const d = new Date();
        d.setDate(d.getDate() - 7);

        return Order.aggregate([
            { $match: { paymentStatus: "paid", createdAt: { $gte: d } } },
            {
                $group: {
                    _id: {
                        $dateToString: { date: "$createdAt", format: "%d-%m" },
                    },
                    total: { $sum: "$totalAmount" },
                    orders: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);
    },

    // 5. Revenue by month (Line chart)
    async getRevenueByYear(year) {
        return Order.aggregate([
            {
                $match: {
                    paymentStatus: "paid",
                    createdAt: {
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`),
                    },
                },
            },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    revenue: { $sum: "$totalAmount" },
                },
            },
            { $sort: { _id: 1 } },
        ]);
    },

    // 6. Active User Map (Heatmap)
    async getUserMap() {
        return User.aggregate([
            {
                $group: {
                    _id: {
                        city: "$defaultAddress.city",
                        district: "$defaultAddress.district",
                    },
                    userCount: { $sum: 1 },
                },
            },
        ]);
    },

    // 7. Payment Summary
    async getPaymentSummary() {
        const raw = await Order.aggregate([
            {
                $match: {
                    $or: [
                        // Tính cho tất cả cổng đã paid
                        { paymentStatus: "paid" },
                        // COD: chỉ tính khi đã giao/hoàn tất (tránh confirmed nhưng chưa thu tiền)
                        {
                            paymentMethod: { $in: COD_METHODS },
                            status: { $in: ["delivered", "completed"] },
                            paymentStatus: { $ne: "failed" },
                        },
                    ],
                },
            },
            {
                $group: {
                    _id: "$paymentMethod",
                    total: { $sum: "$totalAmount" },
                },
            },
        ]);

        const codTotal = raw
            .filter((x) => COD_METHODS.includes(x._id))
            .reduce((sum, x) => sum + x.total, 0);

        const codTotal = raw
            .filter((x) => COD_METHODS.includes(x._id))
            .reduce((sum, x) => sum + x.total, 0);

        return {
            momo: raw.find((x) => x._id === "momo")?.total || 0,
            vietqr:
                raw.find((x) => x._id === "vietqr")?.total ||
                raw.find((x) => x._id === "vnpay")?.total ||
                0,
            zalopay: raw.find((x) => x._id === "zalopay")?.total || 0,
            cod: codTotal,
        };
    },
};
