const CoinTransaction = require("../models/coin-transaction.model");

module.exports = {
  create: (data) => CoinTransaction.create(data),

  findByUser: (userId, limit = 50) =>
    CoinTransaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit),
};
