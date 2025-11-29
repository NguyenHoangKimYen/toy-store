import React, { useState, useRef } from 'react';
import { Star, ImagePlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import './ReviewForm.css';

const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const ReviewForm = ({ onSubmit, submitting }) => {
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [images, setImages] = useState([]);
  const [imageError, setImageError] = useState('');
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
        setImageError('Only JPEG, PNG, WebP, and GIF images are allowed');
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        setImageError('Each image must be under 5MB');
        continue;
      }
      validFiles.push({
        file,
        preview: URL.createObjectURL(file)
      });
    }

    setImages(prev => [...prev, ...validFiles]);
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index) => {
    setImages(prev => {
      // Revoke object URL to prevent memory leaks
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
    setImageError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      return;
    }

    // Pass images as File objects for FormData
    onSubmit({ 
      rating, 
      content: content.trim(),
      images: images.map(img => img.file)
    });
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
      </div>

      <div className="review-form-group">
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

      <div className="review-form-group">
        <Label>Add Photos (optional)</Label>
        <div className="image-upload-section">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            onChange={handleImageSelect}
            className="image-input"
            id="review-images"
            disabled={submitting || images.length >= MAX_IMAGES}
          />
          <label 
            htmlFor="review-images" 
            className={`image-upload-button ${images.length >= MAX_IMAGES ? 'disabled' : ''}`}
          >
            <ImagePlus size={20} />
            <span>Add Images</span>
            <span className="image-count">({images.length}/{MAX_IMAGES})</span>
          </label>
        </div>
        
        {imageError && (
          <p className="image-error">{imageError}</p>
        )}

        {images.length > 0 && (
          <div className="image-preview-grid">
            {images.map((img, index) => (
              <div key={index} className="image-preview-item">
                <img src={img.preview} alt={`Preview ${index + 1}`} />
                <button
                  type="button"
                  className="image-remove-button"
                  onClick={() => removeImage(index)}
                  disabled={submitting}
                  aria-label="Remove image"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="review-form-actions">
        <Button type="submit" disabled={submitting || !content.trim()}>
          {submitting ? 'Submitting...' : 'Submit Review'}
        </Button>
      </div>
    </form>
  );
};

export default ReviewForm;
