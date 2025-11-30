import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import './ReviewForm.css';

const ReviewForm = ({ onSubmit, submitting }) => {
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ rating });
  };

  return (
    <form onSubmit={handleSubmit} className="review-form">
      <div className="review-form-group">
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
        <p className="rating-label">
          {rating === 1 && 'Poor'}
          {rating === 2 && 'Fair'}
          {rating === 3 && 'Good'}
          {rating === 4 && 'Very Good'}
          {rating === 5 && 'Excellent'}
        </p>
      </div>

      <div className="review-form-actions">
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit Rating'}
        </Button>
      </div>
    </form>
  );
};

export default ReviewForm;
