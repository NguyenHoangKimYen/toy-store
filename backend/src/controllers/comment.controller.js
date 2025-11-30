const CommentService = require('../services/comment.service');

/**
 * Create a new comment
 * No authentication required - guests can comment
 * Supports image uploads (up to 3 images)
 */
const createComment = async (req, res, next) => {
    try {
        const { productId, content, guestName, guestEmail, parentId } = req.body;
        
        // User might be logged in or not
        const userId = req.user?._id || req.user?.id || null;

        // Get uploaded files (from multer)
        const imgFiles = req.files || [];

        const comment = await CommentService.createComment({
            productId,
            userId,
            guestName,
            guestEmail,
            content,
            parentId,
            imgFiles,
        });

        res.status(201).json({
            success: true,
            message: 'Comment created successfully',
            metadata: comment,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get comments for a product
 * Shows flagged comments only to their author
 */
const getCommentsByProductId = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const { page = 1, limit = 20, parentId = null } = req.query;
        
        // Get current user ID if authenticated (for showing their own flagged comments)
        const currentUserId = req.user?._id || req.user?.id || null;

        const result = await CommentService.getCommentsByProductId({
            productId,
            page: parseInt(page),
            limit: parseInt(limit),
            parentId: parentId === 'null' ? null : parentId,
            currentUserId,
        });

        res.status(200).json({
            success: true,
            metadata: result,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get replies for a comment
 */
const getReplies = async (req, res, next) => {
    try {
        const { commentId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const result = await CommentService.getReplies(
            commentId,
            parseInt(page),
            parseInt(limit)
        );

        res.status(200).json({
            success: true,
            metadata: result,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete a comment
 * Requires authentication
 */
const deleteComment = async (req, res, next) => {
    try {
        const { commentId } = req.params;
        const userId = req.user?._id || req.user?.id;
        const isAdmin = req.user?.role === 'admin';

        await CommentService.deleteComment({
            commentId,
            userId,
            isAdmin,
        });

        res.status(200).json({
            success: true,
            message: 'Comment deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Toggle like on a comment
 * Requires authentication
 */
const toggleCommentLike = async (req, res, next) => {
    try {
        const { commentId } = req.params;
        const userId = req.user?._id || req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Login required to like comments',
            });
        }

        const result = await CommentService.toggleCommentLike({
            commentId,
            userId,
        });

        res.status(200).json({
            success: true,
            ...result,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all comments for admin management
 * @route GET /api/comments/admin/all
 * @access Admin only
 */
const getAllCommentsAdmin = async (req, res, next) => {
    try {
        const { status, page = 1, limit = 50, sort = 'createdAt:desc' } = req.query;
        
        const result = await CommentService.getAllCommentsAdmin({
            status: status !== 'all' ? status : null,
            page: parseInt(page),
            limit: parseInt(limit),
            sort,
        });

        res.status(200).json({
            success: true,
            message: 'Comments fetched successfully',
            metadata: result,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Moderate a comment (approve/reject/flag)
 * @route PATCH /api/comments/:commentId/moderate
 * @access Admin only
 */
const moderateComment = async (req, res, next) => {
    try {
        const { commentId } = req.params;
        const { status, reason } = req.body;

        if (!['approved', 'flagged', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be approved, flagged, or rejected',
            });
        }

        const result = await CommentService.moderateComment({
            commentId,
            status,
            reason,
        });

        res.status(200).json({
            success: true,
            message: `Comment ${status} successfully`,
            metadata: result,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createComment,
    getCommentsByProductId,
    getReplies,
    deleteComment,
    toggleCommentLike,
    getAllCommentsAdmin,
    moderateComment,
};
