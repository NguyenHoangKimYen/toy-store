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
    getUserById,
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

// ============ PUBLIC ENDPOINTS (No auth required) ============
// Check username availability
router.get("/check-username", async (req, res, next) => {
    try {
        const { username } = req.query;
        if (!username) {
            return res.status(400).json({
                success: false,
                message: "Username is required"
            });
        }
        
        const userRepository = require("../repositories/user.repository.js");
        const existingUser = await userRepository.findByUsername(username);
        
        res.json({
            success: true,
            available: !existingUser,
            message: existingUser ? "Username is already taken" : "Username is available"
        });
    } catch (error) {
        next(error);
    }
});

// Check email availability
router.get("/check-email", async (req, res, next) => {
    try {
        const { email } = req.query;
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }
        
        const userRepository = require("../repositories/user.repository.js");
        const existingUser = await userRepository.findByEmail(email);
        
        res.json({
            success: true,
            available: !existingUser,
            message: existingUser ? "Email is already taken" : "Email is available"
        });
    } catch (error) {
        next(error);
    }
});

// ============ ADMIN ============
router.use(auth);

// GET: tất cả user hoặc search theo param
router.get("/", adminOnly, getAllUsers);

router.get("/:userId", auth, getUserById);

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
