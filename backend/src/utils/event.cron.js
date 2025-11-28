const cron = require('node-cron');
const { generateEventVouchers } = require('../services/event-voucher.service');

cron.schedule('0 7 * * *', async () => {
    console.log('[EVENT CRON] Running daily event voucher check...');
    await generateEventVouchers();
});
