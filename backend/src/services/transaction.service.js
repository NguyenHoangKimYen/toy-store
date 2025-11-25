const axios = require("axios");
const orderRepository = require("../repositories/order.repository");

async function pollBankTransactions() {
    try {
        const res = await axios.get(process.env.BANK_HISTORY_URL, {
            headers: { Authorization: `Bearer ${process.env.BANK_API_KEY}` },
        });

        const transactions = res.data.data || [];

        for (const tx of transactions) {
            if (!tx.description) continue;

            const match = tx.description.match(/MB_(\w{24})/);
            if (!match) continue;

            const orderId = match[1];

      const order = await orderRepository.findById(orderId);
      if (!order || order.paymentStatus === "paid") continue;

      // UPDATE ORDER THÀNH PAID + CONFIRMED
      await orderRepository.updatePaymentStatus(orderId, { paymentStatus: "paid", status: "confirmed" });

      console.log("✔ Auto-paid order:", orderId, " → paid");
    }
}

setInterval(pollBankTransactions, 10 * 1000);

module.exports = { pollBankTransactions };
