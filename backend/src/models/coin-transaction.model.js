const mongoose = require("mongoose");

const coinTransactionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        type: {
            type: String,
            enum: ["earn", "spend", "adjust"],
            required: true,
        },

        amount: {
            type: Number,
            required: true,
        },

        balanceAfter: {
            type: Number,
            required: true,
        },

        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            default: null,
        },

        description: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
        collection: "coin_transactions",
    },
);

module.exports = mongoose.model("CoinTransaction", coinTransactionSchema);
