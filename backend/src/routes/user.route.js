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

router.get("/", auth, adminOnly, getAllUsers);
router.get("/email/:email", getUserByEmail);
router.get("/phone/:phone", getUserByPhone);
router.get("/username/:username", getUserByUsername);
router.get("/:id", getUserById);
router.post("/", auth, adminOnly, createUser);
router.patch("/:id/verify", verifyUser);
router.patch("/:id/set-password", setUserPassword);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.post("/:id/avatar", uploadAvatarMiddleware, uploadAvatarController);
router.patch("/:id/avatar", uploadAvatarMiddleware, updateAvatarController);
module.exports = router;
