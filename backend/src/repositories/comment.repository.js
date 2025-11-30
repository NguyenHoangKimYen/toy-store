const Comment = require('../models/comment.model');

const createComment = async (commentData) => {
    const comment = new Comment(commentData);
    await comment.save();
    return comment.populate('userId', 'fullName avatar username');
};

const getCommentsByProductId = async ({
    productId,
    page = 1,
    limit = 20,
    parentId = null,
    currentUserId = null,
}) => {
    const skip = (page - 1) * limit;
    
    // Build query: show approved comments to everyone, 
    // AND show flagged comments only to their author
    let query;
    if (currentUserId) {
        query = {
            productId,
            parentId,
            $or: [
                { status: 'approved' },
                { status: 'flagged', userId: currentUserId },
            ],
        };
    } else {
        query = { 
            productId,
            parentId,
            status: 'approved',
        };
    }

    const comments = await Comment.find(query)
        .populate('userId', 'fullName avatar username')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

    const totalCount = await Comment.countDocuments(query);

    return {
        comments,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: parseInt(page),
    };
};

const getCommentById = async (commentId) => {
    return await Comment.findById(commentId);
};

const updateCommentById = async (commentId, updateData) => {
    return await Comment.findByIdAndUpdate(commentId, updateData, { new: true });
};

const deleteCommentById = async (commentId) => {
    // Also delete all replies
    await Comment.deleteMany({ parentId: commentId });
    return await Comment.findByIdAndDelete(commentId);
};

const getReplies = async (parentId, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    
    const replies = await Comment.find({ 
        parentId, 
        status: 'approved' 
    })
        .populate('userId', 'fullName avatar username')
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .lean();

    const totalCount = await Comment.countDocuments({ parentId, status: 'approved' });

    return {
        replies,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
    };
};

module.exports = {
    createComment,
    getCommentsByProductId,
    getCommentById,
    updateCommentById,
    deleteCommentById,
    getReplies,
};
