const express = require("express");
const router = express.Router();
const {
    getReviewsByProductId,
    createReview,
    updateReview,
    deleteReview
} = require("../controllers/review.controller");

// Import Middleware xác thực (Bạn thay đường dẫn đúng với project của bạn)
// Middleware này có nhiệm vụ: Check Token -> Lấy info User -> Gán vào req.user
// Nếu chưa có, bạn cần tạo file này (thường là verifyToken hoặc checkAuth)
const authentication = require("../middlewares/auth.middleware.js"); // Ví dụ đường dẫn
// Hoặc: const { verifyToken } = require("../middlewares/auth.middleware");

// --- PUBLIC ROUTES (Không cần đăng nhập) ---

// Lấy danh sách review của một sản phẩm
// GET /api/v1/reviews/product/:productId?page=1&limit=5&rating=5
router.get("/product/:productId", getReviewsByProductId);


// --- PROTECTED ROUTES (Phải đăng nhập) ---
// Các route bên dưới dòng này đều đi qua middleware xác thực
router.use(authentication); 

// Tạo review mới
router.post("/", createReview);

// Sửa review (Chỉ chủ sở hữu)
router.patch("/:reviewId", updateReview);

// Xóa review (Chủ sở hữu hoặc Admin)
router.delete("/:reviewId", deleteReview);

module.exports = router;