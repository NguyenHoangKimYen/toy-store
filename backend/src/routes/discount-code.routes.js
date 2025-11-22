const express = require("express");
const router = express.Router();
const discountController = require("../controllers/discount-code.controller");
const adminOnly = require("../middlewares/admin.middleware");
const auth = require("../middlewares/auth.middleware");

// Admin tạo discount code
router.post("/", auth, adminOnly, discountController.create);

// Admin update
router.put("/:id", auth, adminOnly, discountController.update);

// Admin delete
router.delete("/:id", auth, adminOnly, discountController.delete);

// Admin xem toàn bộ
router.get("/", auth, adminOnly, discountController.getAll);

// User check discount code hợp lệ
router.post("/validate", auth, discountController.validate);

module.exports = router;
