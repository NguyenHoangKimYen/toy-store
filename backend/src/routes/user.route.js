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
    getUserById,
    checkUsername,
    checkEmail,
    updateProfile,
} = require("../controllers/user.controller.js");

const router = express.Router();

// ============ PUBLIC ROUTES (No auth required) ============
// Check username availability
router.get("/check-username", checkUsername);

// Check email availability
router.get("/check-email", checkEmail);

// ============ PROTECTED ROUTES (Auth required) ============
router.use(auth);

// GET: tất cả user hoặc search theo param
router.get("/", adminOnly, getAllUsers);

router.get("/:userId", auth, getUserById);

// Admin tạo user
router.post("/", adminOnly, createUser);

// Admin update user
router.put("/", auth, adminOnly, updateUser);

// Admin delete user
router.delete("/", adminOnly, deleteUser);

// ============ USER ROUTES ============

// User tự cập nhật hồ sơ của mình
router.put("/me", auth, updateProfile);

// Verify user
router.patch("/verify", verifyUser);

// Set password
router.patch("/set-password", setUserPassword);

// Upload avatar
router.post(
    "/avatar",
    uploadAvatarMiddleware,
    uploadAvatarController,
);

// Update avatar
router.patch(
    "/avatar",
    uploadAvatarMiddleware,
    updateAvatarController,
);

module.exports = router;
