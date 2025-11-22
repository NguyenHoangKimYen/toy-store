const repo = require("../repositories/product-analytics.repository");

module.exports = {
    async getTopSelling() {
        return repo.getTopSelling();
    },
    async getHighStock() {
        return repo.getHighStock();
    },
    async getLowStock() {
        return repo.getLowStock();
    },
    async getProductRevenue() {
        return repo.getProductRevenue();
    },
    async getCategoryStats() {
        return repo.getCategoryStats();
    },
};
