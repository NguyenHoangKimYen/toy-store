import { useEffect, useCallback } from 'react';
import { socketService } from '@/services/socket.service';

/**
 * Hook for real-time product review/comment updates via WebSocket
 * Uses the centralized socketService singleton
 * @param {string} productId - Product ID to subscribe to
 * @param {Object} handlers - Event handlers { onNewReview, onReviewDeleted, onNewComment, onCommentDeleted }
 * @returns {Object} - { isConnected }
 */
export const useProductSocket = (productId, handlers = {}) => {
  const {
    onNewReview,
    onReviewDeleted,
    onNewComment,
    onCommentDeleted,
    onStatsUpdated,
  } = handlers;

  // Handler for new reviews
  const handleNewReview = useCallback((data) => {
    if (data.productId === productId && onNewReview) {
      onNewReview(data.review);
    }
  }, [productId, onNewReview]);

  // Handler for deleted reviews
  const handleReviewDeleted = useCallback((data) => {
    if (data.productId === productId && onReviewDeleted) {
      onReviewDeleted(data.reviewId);
    }
  }, [productId, onReviewDeleted]);

  // Handler for new comments
  const handleNewComment = useCallback((data) => {
    if (data.productId === productId && onNewComment) {
      onNewComment(data.comment);
    }
  }, [productId, onNewComment]);

  // Handler for deleted comments
  const handleCommentDeleted = useCallback((data) => {
    if (data.productId === productId && onCommentDeleted) {
      onCommentDeleted(data.commentId);
    }
  }, [productId, onCommentDeleted]);

  // Handler for stats updates
  const handleStatsUpdated = useCallback((data) => {
    if (data.productId === productId && onStatsUpdated) {
      onStatsUpdated(data.stats);
    }
  }, [productId, onStatsUpdated]);

  useEffect(() => {
    if (!productId) return;

    // Ensure socket is connected (null userId for anonymous users)
    // This will create the socket connection if it doesn't exist
    socketService.connect(null);

    // Join product room
    socketService.joinProductRoom(productId);

    // Register event handlers
    socketService.on('new_review', handleNewReview);
    socketService.on('review_deleted', handleReviewDeleted);
    socketService.on('new_comment', handleNewComment);
    socketService.on('comment_deleted', handleCommentDeleted);
    socketService.on('stats_updated', handleStatsUpdated);

    // Cleanup on unmount or productId change
    return () => {
      socketService.leaveProductRoom(productId);
      socketService.off('new_review', handleNewReview);
      socketService.off('review_deleted', handleReviewDeleted);
      socketService.off('new_comment', handleNewComment);
      socketService.off('comment_deleted', handleCommentDeleted);
      socketService.off('stats_updated', handleStatsUpdated);
    };
  }, [productId, handleNewReview, handleReviewDeleted, handleNewComment, handleCommentDeleted, handleStatsUpdated]);

  return {
    isConnected: socketService.isConnected(),
  };
};

export default useProductSocket;
