module.exports = [
    {
        code: "FIRST_PURCHASE",
        condition: (user) => user.lifetimeSpent > 0,
        title: "Mua hàng đầu tiên",
    },
    {
        code: "VIP_SPENDER",
        condition: (user) => user.lifetimeSpent >= 5_000_000,
        title: "Chi tiêu 5 triệu",
    },
    {
        code: "LOYAL_10_ORDERS",
        condition: (user) => user.orderCount >= 10,
        title: "Đơn hàng thứ 10",
    },
];
