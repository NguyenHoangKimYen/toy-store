const express = require("express");
const auth = require("../middlewares/auth.middleware.js");
const adminOnly = require("../middlewares/admin.middleware.js");

const {
    uploadAvatar: uploadAvatarMiddleware,
} = require("../middlewares/upload.middleware.js");

const {
    getAllUsers,
    getUserById,
    getUserByEmail,
    getUserByPhone,
    getUserByUsername,
    createUser,
    verifyUser,
    setUserPassword,
    updateUser,
    deleteUser,
    uploadAvatar: uploadAvatarController,
    updateAvatar: updateAvatarController,
} = require("../controllers/user.controller.js");

const router = express.Router();

/**
 * User chỉ được chỉnh tài khoản của chính họ
 * Admin có thể chỉnh tất cả
 */
const ownerOrAdmin = (req, res, next) => {
    if (req.user.role === "admin") return next();
    if (req.user.id === req.params.id) return next();

    return res.status(403).json({
        success: false,
        message: "Forbidden: You cannot modify another user.",
    });
};
// ADMIN ROUTE

// Get all users
router.get("/", auth, adminOnly, getAllUsers);

// Admin create new user
router.post("/", auth, adminOnly, createUser);

// Admin update user
router.put("/:id", auth, adminOnly, updateUser);

// Admin delete user
router.delete("/:id", auth, adminOnly, deleteUser);

// Admin lookup user by email/phone/username
router.get("/email/:email", auth, adminOnly, getUserByEmail);
router.get("/phone/:phone", auth, adminOnly, getUserByPhone);
router.get("/username/:username", auth, adminOnly, getUserByUsername);
// USER ROUTE

// Get user info (owner or admin)
router.get("/:id", auth, ownerOrAdmin, getUserById);

// Verify user
router.patch("/:id/verify", auth, ownerOrAdmin, verifyUser);

// User change password
router.patch("/:id/set-password", auth, ownerOrAdmin, setUserPassword);

// User upload new avatar
router.post(
    "/:id/avatar",
    auth,
    ownerOrAdmin,
    uploadAvatarMiddleware,
    uploadAvatarController
);

// User update avatar
router.patch(
    "/:id/avatar",
    auth,
    ownerOrAdmin,
    uploadAvatarMiddleware,
    updateAvatarController
);

module.exports = router;
