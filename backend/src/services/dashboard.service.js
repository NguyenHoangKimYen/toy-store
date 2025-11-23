const dashboardRepo = require("../repositories/dashboard.repository");
const branchRepository = require("../repositories/branch.repository");

module.exports = {
    async getSalesDistribution() {
        const total = await dashboardRepo.getTotalRevenue();
        const channel = await dashboardRepo.getRevenueByChannel();

        return {
            totalRevenue: total,
            byWebsite: channel.website,
            byMobile: channel.mobile,
            byCOD: channel.cod,
            byEwallet: channel.ewallet
        };
    },

    async getSalesOverview() {
        return dashboardRepo.getUserSegmentation();
    },

    async getRevenueUpdates() {
        return dashboardRepo.getLast7DaysRevenue();
    },

    async getYearlySales() {
        const year = new Date().getFullYear();
        const thisYear = await dashboardRepo.getRevenueByYear(year);
        const lastYear = await dashboardRepo.getRevenueByYear(year - 1);

        return { thisYear, lastYear };
    },

    async getUserMap() {
        return dashboardRepo.getUserMap();
    },

    async getPaymentSummary() {
        return dashboardRepo.getPaymentSummary();
    },
    // chi nhánh cửa hàng
    async getBranchesMap() {
        return branchRepository.getBranchesWithOrderStats();
    }
};
