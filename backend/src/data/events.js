module.exports = [
    {
        code: "BLACK_FRIDAY",
        date: "11-29",
        discount: 20,            // 20%
        maxUses: 1,              // mỗi user chỉ dùng 1 lần
        autoGenerate: true
    },
    {
        code: "SINGLE_DAY_11_11",
        date: "11-11",
        discount: 15,
        maxUses: 1,
        autoGenerate: true
    },
    {
        code: "DOUBLE_DAY_12_12",
        date: "12-12",
        discount: 15,
        maxUses: 1,
        autoGenerate: true
    },
    {
        code: "PAYDAY",
        dayRange: [25, 30],      // mỗi tháng ngày 25 → 30 tự sinh voucher
        discount: 10,
        maxUses: 1,
        autoGenerate: true
    }
];
