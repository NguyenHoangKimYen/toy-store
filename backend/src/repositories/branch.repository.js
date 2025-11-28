const Order = require('../models/order.model');
const branches = require('../data/branches');

module.exports = {
    async getBranchesWithOrderStats() {
        // Lấy thống kê đơn hàng theo chi nhánh
        const orderStats = await Order.aggregate([
            { $match: { paymentStatus: 'paid' } },
            {
                $group: {
                    _id: '$warehouseCode', // cần có field này trong Order
                    orderCount: { $sum: 1 },
                },
            },
        ]);

        // Map vào danh sách chi nhánh
        return branches.map((branch) => {
            const stat = orderStats.find((x) => x._id === branch.code);

            const orderCount = stat ? stat.orderCount : 0;

            return {
                code: branch.code,
                name: branch.name,
                province: branch.province,
                lat: branch.lat,
                lng: branch.lng,
                orderCount,
                weight: orderCount / 200, // bạn có thể chỉnh scale
            };
        });
    },
};
