const express = require('express');
const router = express.Router();
const {
    createComment,
    getCommentsByProductId,
    getReplies,
    deleteComment,
    toggleCommentLike,
    getAllCommentsAdmin,
    moderateComment,
} = require('../controllers/comment.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const adminOnly = require('../middlewares/admin.middleware');
const { uploadCommentImages } = require('../middlewares/upload.middleware');

// Optional auth middleware - sets req.user if token exists, but doesn't require it
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(); // No token, continue without user
    }
    // Use the regular auth middleware but catch errors
    authMiddleware(req, res, (err) => {
        if (err) {
            // Token invalid/expired, continue without user
            return next();
        }
        next();
    });
};

// --- PUBLIC ROUTES ---
// Get comments for a product (optional auth - to show user's own flagged comments)
router.get('/product/:productId', optionalAuth, getCommentsByProductId);

// Get replies for a comment
router.get('/:commentId/replies', getReplies);

// Create comment (optional auth - guests can comment, supports image upload)
router.post('/', uploadCommentImages, optionalAuth, createComment);

// --- AUTHENTICATED ROUTES ---
// Toggle like (requires auth)
router.post('/:commentId/like', authMiddleware, toggleCommentLike);

// Delete comment (requires auth)
router.delete('/:commentId', authMiddleware, deleteComment);

// --- ADMIN ROUTES ---
router.get('/admin/all', authMiddleware, adminOnly, getAllCommentsAdmin);
router.patch('/:commentId/moderate', authMiddleware, adminOnly, moderateComment);
router.delete('/admin/:commentId', authMiddleware, adminOnly, deleteComment);

module.exports = router;
