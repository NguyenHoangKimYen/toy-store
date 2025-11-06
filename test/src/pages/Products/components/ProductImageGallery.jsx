import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import './ProductImageGallery.css';

const ProductImageGallery = ({ images = [], productName }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  // Ensure we have at least one image (fallback to placeholder)
  const imageList = images.length > 0 ? images : ['/placeholder.png'];

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? imageList.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === imageList.length - 1 ? 0 : prev + 1));
  };

  const handleThumbnailClick = (index) => {
    setCurrentIndex(index);
  };

  return (
    <div className="product-image-gallery">
      {/* Main Image */}
      <div className="main-image-container">
        <img
          src={imageList[currentIndex]}
          alt={`${productName} - Image ${currentIndex + 1}`}
          className={`main-image ${isZoomed ? 'zoomed' : ''}`}
          onClick={() => setIsZoomed(!isZoomed)}
        />
        
        {imageList.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="gallery-nav-btn prev-btn"
              onClick={handlePrevious}
              aria-label="Previous image"
            >
              <ChevronLeft size={20} />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="gallery-nav-btn next-btn"
              onClick={handleNext}
              aria-label="Next image"
            >
              <ChevronRight size={20} />
            </Button>
          </>
        )}

        <Button
          variant="secondary"
          size="icon"
          className="zoom-btn"
          onClick={() => setIsZoomed(!isZoomed)}
          aria-label="Zoom image"
        >
          <ZoomIn size={20} />
        </Button>

        {imageList.length > 1 && (
          <div className="image-counter">
            {currentIndex + 1} / {imageList.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {imageList.length > 1 && (
        <div className="thumbnails-container">
          {imageList.map((image, index) => (
            <button
              key={index}
              className={`thumbnail ${index === currentIndex ? 'active' : ''}`}
              onClick={() => handleThumbnailClick(index)}
            >
              <img src={image} alt={`Thumbnail ${index + 1}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;
