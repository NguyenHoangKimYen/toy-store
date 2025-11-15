import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import './ReviewForm.css';

const ReviewForm = ({ onSubmit, submitting }) => {
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      return;
    }

    onSubmit({ rating, content: content.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="review-form">
      <div className="form-group">
        <Label>Your Rating</Label>
        <div className="star-rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="star-button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
            >
              <Star
                size={32}
                className={star <= (hoveredRating || rating) ? 'star-active' : 'star-inactive'}
                fill={star <= (hoveredRating || rating) ? 'currentColor' : 'none'}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <Label htmlFor="review-content">Your Review</Label>
        <textarea
          id="review-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your experience with this product..."
          className="review-textarea"
          rows={5}
          required
          disabled={submitting}
        />
        <p className="character-count">{content.length} characters</p>
      </div>

      <div className="form-actions">
        <Button type="submit" disabled={submitting || !content.trim()}>
          {submitting ? 'Submitting...' : 'Submit Review'}
        </Button>
      </div>
    </form>
  );
};

export default ReviewForm;
