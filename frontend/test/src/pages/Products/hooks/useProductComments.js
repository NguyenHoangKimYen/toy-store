import { useState, useEffect, useCallback } from 'react';
import { getProductComments, createComment, deleteComment, toggleCommentLike } from '@/services/comments.service';
import { socketService } from '@/services/socket.service';
import { toast } from 'sonner';
import { useAuth } from '@/hooks';

export const useProductComments = (productId) => {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Real-time handler for new comments from WebSocket
  const handleNewComment = useCallback((data) => {
    if (data.productId === productId && data.comment) {
      const newComment = data.comment;
      
      // Only add if not already in the list
      setComments(prev => {
        if (prev.some(c => c._id === newComment._id)) {
          return prev;
        }
        
        // For flagged comments from others, don't add them
        // (only the author should see flagged comments, handled by backend)
        if (newComment.status === 'flagged') {
          // Check if this is our own comment
          const isOwnComment = user && (
            newComment.userId?._id === user._id || 
            newComment.userId === user._id
          );
          if (!isOwnComment) {
            return prev; // Don't add other users' flagged comments
          }
        }
        
        return [newComment, ...prev];
      });
    }
  }, [productId, user]);

  // Real-time handler for deleted comments from WebSocket
  const handleCommentDeleted = useCallback((data) => {
    if (data.productId === productId) {
      setComments(prev => prev.filter(c => c._id !== data.commentId));
    }
  }, [productId]);

  // Subscribe to WebSocket events
  useEffect(() => {
    if (!productId) return;

    // Ensure socket is connected
    socketService.connect(null);
    
    // Join product room
    socketService.joinProductRoom(productId);

    // Register event handlers
    socketService.on('new_comment', handleNewComment);
    socketService.on('comment_deleted', handleCommentDeleted);

    return () => {
      // Cleanup: unsubscribe from events (don't leave room, ReviewSection handles that)
      socketService.off('new_comment', handleNewComment);
      socketService.off('comment_deleted', handleCommentDeleted);
    };
  }, [productId, handleNewComment, handleCommentDeleted]);

  const loadComments = useCallback(async (resetPage = false) => {
    if (!productId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const currentPage = resetPage ? 1 : page + 1;
      
      const data = await getProductComments(productId, {
        limit: pageSize,
        page: currentPage,
      });
      
      const commentsData = data.metadata?.comments || data.comments || [];
      
      if (resetPage) {
        setComments(commentsData);
        setPage(1);
      } else {
        setComments(prev => [...prev, ...commentsData]);
        setPage(currentPage);
      }
      
      const total = data.metadata?.total || data.total || 0;
      setHasMore((currentPage * pageSize) < total);
    } catch (err) {
      console.error('Error loading comments:', err);
      setError(err.message || 'Failed to load comments');
    } finally {
      setLoading(false);
    }
  }, [productId, page, pageSize]);

  useEffect(() => {
    if (productId) {
      loadComments(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const addComment = async (commentData) => {
    try {
      setSubmitting(true);
      
      const result = await createComment({
        productId,
        content: commentData.content,
        guestName: commentData.guestName || (user?.fullName || user?.username),
        guestEmail: commentData.guestEmail,
        parentId: commentData.parentId || null,
        images: commentData.images || [],
      });
      
      const newComment = result.metadata || result;
      
      // Add comment locally immediately for instant feedback
      // WebSocket handler has deduplication, so no duplicates will occur
      setComments(prev => {
        // Prevent duplicates (in case WebSocket arrives before this)
        if (prev.some(c => c._id === newComment._id)) {
          return prev;
        }
        return [newComment, ...prev];
      });
      
      // Show appropriate message based on comment status
      if (newComment.status === 'flagged') {
        toast.warning('Your comment has been flagged for review and is only visible to you.');
      } else {
        toast.success('Comment posted successfully!');
      }
      return true;
    } catch (err) {
      console.error('Error posting comment:', err);
      toast.error(err.message || 'Failed to post comment');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const removeComment = async (commentId) => {
    try {
      await deleteComment(commentId);
      
      // Remove comment from the list
      setComments(prev => prev.filter(c => c._id !== commentId));
      
      toast.success('Comment deleted successfully');
      return true;
    } catch (err) {
      console.error('Error deleting comment:', err);
      toast.error(err.message || 'Failed to delete comment');
      return false;
    }
  };

  const toggleLike = async (commentId) => {
    if (!isAuthenticated) {
      toast.error('Please log in to like comments');
      return false;
    }

    try {
      const response = await toggleCommentLike(commentId);
      const { likesCount, isLiked } = response;
      
      // Update the comment in the list
      setComments(prev => prev.map(comment => 
        comment._id === commentId 
          ? { ...comment, likesCount, isLiked }
          : comment
      ));
      
      return true;
    } catch (err) {
      console.error('Error toggling like:', err);
      if (err.response?.status === 401) {
        toast.error('Please log in to like comments');
      } else {
        toast.error('Failed to update like status');
      }
      return false;
    }
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1);
    }
  };

  // Load more when page changes
  useEffect(() => {
    if (page > 1) {
      loadComments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return {
    comments,
    loading,
    submitting,
    error,
    hasMore,
    addComment,
    removeComment,
    toggleLike,
    loadMore,
    refetch: () => loadComments(true),
  };
};
