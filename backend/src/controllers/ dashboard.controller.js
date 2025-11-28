const dashboardService = require('../services/dashboard.service');
const productAnalyticsService = require('../services/product-analytics.service');

module.exports = {
    // --- EXISTING DASHBOARD CONTROLLERS ---
    async getSalesOverview(req, res) {
        res.json({
            success: true,
            data: await dashboardService.getSalesOverview(),
        });
    },

    async getRevenueUpdates(req, res) {
        res.json({
            success: true,
            data: await dashboardService.getRevenueUpdates(),
        });
    },

    async getYearlySales(req, res) {
        res.json({
            success: true,
            data: await dashboardService.getYearlySales(),
        });
    },

    async getPaymentSummary(req, res) {
        res.json({
            success: true,
            data: await dashboardService.getPaymentSummary(),
        });
    },

    // --- PRODUCT ANALYTICS (GỘP CHUNG DASHBOARD) ---
    async getTopSelling(req, res) {
        res.json({
            success: true,
            data: await productAnalyticsService.getTopSelling(),
        });
    },

    async getHighStock(req, res) {
        res.json({
            success: true,
            data: await productAnalyticsService.getHighStock(),
        });
    },

    async getLowStock(req, res) {
        res.json({
            success: true,
            data: await productAnalyticsService.getLowStock(),
        });
    },

    async getProductRevenue(req, res) {
        res.json({
            success: true,
            data: await productAnalyticsService.getProductRevenue(),
        });
    },

    async getCategoryStats(req, res) {
        res.json({
            success: true,
            data: await productAnalyticsService.getCategoryStats(),
        });
    },

    async getBranchesMap(req, res) {
        res.json({
            success: true,
            data: await dashboardService.getBranchesMap(),
        });
    },
};
