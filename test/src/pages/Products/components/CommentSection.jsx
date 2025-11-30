import React, { useState, useRef } from 'react';
import { MessageCircle, ThumbsUp, Trash2, Reply, User, Send, ImagePlus, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useProductComments } from '../hooks/useProductComments';
import { useAuth } from '@/hooks';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import LoginPromptDialog from '@/components/common/LoginPromptDialog';
import './CommentSection.css';

const MAX_IMAGES = 3;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const CommentSection = ({ productId }) => {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const {
    comments,
    loading,
    submitting,
    hasMore,
    addComment,
    removeComment,
    toggleLike,
    loadMore,
  } = useProductComments(productId);

  const [newComment, setNewComment] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [images, setImages] = useState([]);
  const [imageError, setImageError] = useState('');
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [loginPromptAction, setLoginPromptAction] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const fileInputRef = useRef(null);

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    setImageError('');

    // Check total count
    if (images.length + files.length > MAX_IMAGES) {
      setImageError(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    // Validate each file
    const validFiles = [];
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setImageError('Only JPEG, PNG, and WebP images are allowed');
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        setImageError('Each image must be under 5MB');
        continue;
      }
      validFiles.push({
        file,
        preview: URL.createObjectURL(file),
      });
    }

    setImages((prev) => [...prev, ...validFiles]);
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index) => {
    setImages((prev) => {
      // Revoke object URL to prevent memory leaks
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
    setImageError('');
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;

    const success = await addComment({
      content: newComment,
      guestName: isAuthenticated ? null : guestName || 'Anonymous',
      guestEmail: isAuthenticated ? null : guestEmail,
      images: images.map((img) => img.file),
    });

    if (success) {
      setNewComment('');
      setGuestName('');
      setGuestEmail('');
      // Clean up image previews
      images.forEach((img) => URL.revokeObjectURL(img.preview));
      setImages([]);
      setImageError('');
    }
  };

  const handleSubmitReply = async (parentId) => {
    if (!replyContent.trim()) return;

    const success = await addComment({
      content: replyContent,
      parentId,
      guestName: isAuthenticated ? null : 'Anonymous',
    });

    if (success) {
      setReplyingTo(null);
      setReplyContent('');
    }
  };

  const handleToggleLike = async (commentId) => {
    if (!isAuthenticated) {
      setLoginPromptAction('like this comment');
      setShowLoginPrompt(true);
      return;
    }
    await toggleLike(commentId);
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      await removeComment(commentId);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDisplayName = (comment) => {
    if (comment.userId?.fullName) return comment.userId.fullName;
    if (comment.userId?.username) return comment.userId.username;
    return comment.guestName || 'Anonymous';
  };

  const isOwnComment = (comment) => {
    if (!user) return false;
    return comment.userId?._id === user._id || comment.userId === user._id;
  };

  return (
    <div className="comment-section">
      <div className="comment-header">
        <MessageCircle size={24} />
        <h3>Comments ({comments.length})</h3>
      </div>

      {/* Comment Form */}
      <Card className="comment-form-card">
        <form onSubmit={handleSubmitComment}>
          {!isAuthenticated && (
            <div className="guest-fields">
              <div className="guest-field">
                <Label htmlFor="guestName">Name (optional)</Label>
                <Input
                  id="guestName"
                  placeholder="Your name"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  maxLength={50}
                />
              </div>
              <div className="guest-field">
                <Label htmlFor="guestEmail">Email (optional, not displayed)</Label>
                <Input
                  id="guestEmail"
                  type="email"
                  placeholder="your@email.com"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                />
              </div>
            </div>
          )}
          
          <div className="comment-input-container">
            <Textarea
              placeholder={isAuthenticated ? "Write a comment..." : "Write a comment (no login required)..."}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              maxLength={1000}
            />

            {/* Image Upload Section */}
            <div className="comment-image-upload">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleImageSelect}
                className="image-input"
                id="comment-images"
                disabled={submitting || images.length >= MAX_IMAGES}
              />
              <label
                htmlFor="comment-images"
                className={`image-upload-label ${images.length >= MAX_IMAGES ? 'disabled' : ''}`}
              >
                <ImagePlus size={18} />
                <span>Add Photos ({images.length}/{MAX_IMAGES})</span>
              </label>
            </div>

            {imageError && <p className="image-error">{imageError}</p>}

            {images.length > 0 && (
              <div className="image-preview-grid">
                {images.map((img, index) => (
                  <div key={index} className="image-preview-item">
                    <img src={img.preview} alt={`Preview ${index + 1}`} />
                    <button
                      type="button"
                      className="image-remove-btn"
                      onClick={() => removeImage(index)}
                      disabled={submitting}
                      aria-label="Remove image"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="comment-input-footer">
              <span className="char-count">{newComment.length}/1000</span>
              <Button type="submit" disabled={!newComment.trim() || submitting}>
                <Send size={16} />
                {submitting ? 'Posting...' : 'Post Comment'}
              </Button>
            </div>
          </div>
        </form>
      </Card>

      {/* Comments List */}
      {loading && comments.length === 0 ? (
        <div className="comments-loading">
          <LoadingSpinner />
        </div>
      ) : comments.length === 0 ? (
        <div className="no-comments">
          <MessageCircle size={48} className="no-comments-icon" />
          <p>No comments yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="comments-list">
          {comments.map((comment) => (
            <Card key={comment._id} className={`comment-card ${comment.status === 'flagged' ? 'flagged-comment' : ''}`}>
              <div className="comment-content">
                {/* Flagged Comment Warning - Only shown to the author */}
                {comment.status === 'flagged' && isOwnComment(comment) && (
                  <div className="flagged-warning">
                    <AlertTriangle size={16} />
                    <span>Your comment has been flagged as potentially inappropriate and is only visible to you.</span>
                  </div>
                )}

                <div className="comment-author">
                  <div className="author-avatar">
                    {comment.userId?.avatar ? (
                      <img src={comment.userId.avatar} alt={getDisplayName(comment)} />
                    ) : (
                      <User size={20} />
                    )}
                  </div>
                  <div className="author-info">
                    <span className="author-name">
                      {getDisplayName(comment)}
                      {isOwnComment(comment) && <span className="own-badge">You</span>}
                      {!comment.userId && <span className="guest-badge">Guest</span>}
                    </span>
                    <span className="comment-date">{formatDate(comment.createdAt)}</span>
                  </div>
                </div>

                <p className="comment-text">{comment.content}</p>

                {/* Comment Images */}
                {comment.imageUrls && comment.imageUrls.length > 0 && (
                  <div className="comment-images">
                    {comment.imageUrls.map((url, index) => (
                      <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="comment-image-link"
                      >
                        <img src={url} alt={`Comment image ${index + 1}`} />
                      </a>
                    ))}
                  </div>
                )}

                <div className="comment-actions">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleLike(comment._id)}
                    className={comment.isLiked ? 'liked' : ''}
                  >
                    <ThumbsUp size={16} fill={comment.isLiked ? 'currentColor' : 'none'} />
                    {comment.likesCount > 0 && <span>{comment.likesCount}</span>}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                  >
                    <Reply size={16} />
                    Reply
                  </Button>

                  {(isOwnComment(comment) || user?.role === 'admin') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteComment(comment._id)}
                      className="delete-button"
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>

                {/* Reply Form */}
                {replyingTo === comment._id && (
                  <div className="reply-form">
                    <Textarea
                      placeholder="Write a reply..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      rows={2}
                      maxLength={500}
                    />
                    <div className="reply-actions">
                      <Button
                        size="sm"
                        onClick={() => handleSubmitReply(comment._id)}
                        disabled={!replyContent.trim() || submitting}
                      >
                        Reply
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyContent('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="comment-replies">
                    {comment.replies.map((reply) => (
                      <div key={reply._id} className="reply-item">
                        <div className="comment-author">
                          <div className="author-avatar small">
                            {reply.userId?.avatar ? (
                              <img src={reply.userId.avatar} alt={getDisplayName(reply)} />
                            ) : (
                              <User size={16} />
                            )}
                          </div>
                          <div className="author-info">
                            <span className="author-name">{getDisplayName(reply)}</span>
                            <span className="comment-date">{formatDate(reply.createdAt)}</span>
                          </div>
                        </div>
                        <p className="comment-text">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          ))}

          {hasMore && (
            <div className="load-more-comments">
              <Button onClick={loadMore} variant="outline" disabled={loading}>
                {loading ? 'Loading...' : 'Load More Comments'}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Login Prompt Dialog */}
      <LoginPromptDialog
        open={showLoginPrompt}
        onOpenChange={setShowLoginPrompt}
        action={loginPromptAction}
        returnPath={`/products/${productId}`}
      />
    </div>
  );
};

export default CommentSection;
