const express = require("express");
const auth = require("../middlewares/auth.middleware.js");
const adminOnly = require("../middlewares/admin.middleware.js");
const {
    uploadAvatar: uploadAvatarMiddleware,
} = require("../middlewares/upload.middleware.js");

const {
    getAllUsers,
    createUser,
    verifyUser,
    setUserPassword,
    updateUser,
    deleteUser,
    uploadAvatar: uploadAvatarController,
    updateAvatar: updateAvatarController,
} = require("../controllers/user.controller.js");

const router = express.Router();

// Chỉ owner hoặc admin được sửa user
const ownerOrAdmin = (req, res, next) => {
    if (req.user.role === "admin") return next();
    if (req.user.id === req.query.id) return next();
    return res.status(403).json({
        success: false,
        message: "Forbidden: You cannot modify another user.",
    });
};

// ============ ADMIN ============
router.use(auth);

// GET: tất cả user hoặc search theo param
router.get("/", adminOnly, getAllUsers);

// Admin tạo user
router.post("/", adminOnly, createUser);

// Admin update user
router.put("/", adminOnly, updateUser);

// Admin delete user
router.delete("/", adminOnly, deleteUser);

// ============ USER ============

// Verify user (owner hoặc admin)
router.patch("/verify", ownerOrAdmin, verifyUser);

// Set password
router.patch("/set-password", ownerOrAdmin, setUserPassword);

// Upload avatar
router.post(
    "/avatar",
    ownerOrAdmin,
    uploadAvatarMiddleware,
    uploadAvatarController,
);

// Update avatar
router.patch(
    "/avatar",
    ownerOrAdmin,
    uploadAvatarMiddleware,
    updateAvatarController,
);

module.exports = router;
