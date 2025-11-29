const express = require('express');
const router = express.Router();

const eventVoucherController = require('../controllers/event-voucher.controller');
const adminOnly = require('../middlewares/admin.middleware');
const auth = require('../middlewares/auth.middleware');

// Admin tạo event
router.post('/events', auth, adminOnly, eventVoucherController.createEvent);

// Admin cập nhật event
router.put('/events/:id', auth, adminOnly, eventVoucherController.updateEvent);

// Admin xoá event
router.delete(
    "/events/:id",
    auth,
    adminOnly,
    eventVoucherController.deleteEvent,
);

// Admin xem danh sách event
router.get('/events', auth, adminOnly, eventVoucherController.getEvents);

// User xem voucher từ event (những voucher hợp lệ / đang chạy)
router.get(
    "/events/active-vouchers",
    auth,
    eventVoucherController.getActiveVouchers,
);

module.exports = router;
