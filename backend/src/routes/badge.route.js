const express = require('express');
const router = express.Router();
const badgeController = require("../controllers/badge.controller");
const adminOnly = require("../middlewares/admin.middleware");
const auth = require("../middlewares/auth.middleware");

// Admin tạo badge
router.post('/', auth, adminOnly, badgeController.createBadge);

// Admin cập nhật badge
router.put('/:id', auth, adminOnly, badgeController.updateBadge);

// Admin xoá badge
router.delete('/:id', auth, adminOnly, badgeController.deleteBadge);

// Admin xem toàn bộ badge
router.get('/', auth, adminOnly, badgeController.getAll);

// User xem badge của mình
router.get('/my', auth, badgeController.getMyBadges);

module.exports = router;
