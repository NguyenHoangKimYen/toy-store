const express = require('express');
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
    deleteUser
} = require ('../controllers/user.controller.js');

const router = express.Router();

router.get("/", getAllUsers);
router.get("/email/:email", getUserByEmail);
router.get("/phone/:phone", getUserByPhone);
router.get("/username/:username", getUserByUsername);
router.get("/:id", getUserById);
router.post("/", createUser);
router.put("/:id/verify", verifyUser);
router.patch("/:id/set-password", setUserPassword);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;