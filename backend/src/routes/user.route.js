const express = require('express');
const auth = require('../middlewares/auth.middleware.js');
const adminOnly = require('../middlewares/admin.middleware.js');
const {
    uploadAvatar: uploadAvatarMiddleware,
} = require('../middlewares/upload.middleware.js');

const {
    getAllUsers,
    createUser,
    verifyUser,
    setUserPassword,
    updateUser,
    deleteUser,
    uploadAvatar: uploadAvatarController,
    updateAvatar: updateAvatarController,
} = require('../controllers/user.controller.js');

const router = express.Router();

// Chỉ owner hoặc admin được sửa user
const ownerOrAdmin = (req, res, next) => {
    if (req.user.role === 'admin') return next();
    if (req.user.id === req.query.id) return next();
    return res.status(403).json({
        success: false,
        message: 'Forbidden: You cannot modify another user.',
    });
};

// ============ ADMIN ============

// GET: tất cả user hoặc search theo param
router.get('/', auth, adminOnly, getAllUsers);

// Admin tạo user
router.post('/', auth, adminOnly, createUser);

// Admin update user
router.put('/', auth, adminOnly, updateUser);

// Admin delete user
router.delete('/', auth, adminOnly, deleteUser);

// ============ USER ============

// Verify user (owner hoặc admin)
router.patch('/verify', auth, ownerOrAdmin, verifyUser);

// Set password
router.patch('/set-password', auth, ownerOrAdmin, setUserPassword);

// Upload avatar
router.post(
    '/avatar',
    auth,
    ownerOrAdmin,
    uploadAvatarMiddleware,
    uploadAvatarController,
);

// Update avatar
router.patch(
    '/avatar',
    auth,
    ownerOrAdmin,
    uploadAvatarMiddleware,
    updateAvatarController,
);

module.exports = router;
