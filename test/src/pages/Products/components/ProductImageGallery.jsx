import React, { useState, useMemo, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import './ProductImageGallery.css';

const ProductImageGallery = ({ images = [], selectedVariantImageIndex = 0, productName }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const thumbnailsRef = React.useRef(null);
  const [showUpArrow, setShowUpArrow] = useState(false);
  const [showDownArrow, setShowDownArrow] = useState(false);

  // Ensure we have at least one image (fallback to placeholder)
  const imageList = useMemo(() => {
    return images.length > 0 ? images : ['/placeholder.png'];
  }, [images]);

  // Auto-scroll to selected variant's image when variant changes
  useEffect(() => {
    if (selectedVariantImageIndex >= 0 && selectedVariantImageIndex < imageList.length) {
      setCurrentIndex(selectedVariantImageIndex);
      
      // Scroll thumbnail into view
      if (thumbnailsRef.current) {
        const thumbnailElements = thumbnailsRef.current.children;
        if (thumbnailElements[selectedVariantImageIndex]) {
          thumbnailElements[selectedVariantImageIndex].scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
          });
        }
      }
    }
  }, [selectedVariantImageIndex, imageList.length]);

  // Check if scroll buttons should be shown
  const checkScrollButtons = () => {
    if (thumbnailsRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = thumbnailsRef.current;
      setShowUpArrow(scrollTop > 0);
      setShowDownArrow(scrollTop + clientHeight < scrollHeight - 10);
    }
  };

  React.useEffect(() => {
    checkScrollButtons();
    const container = thumbnailsRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollButtons);
      window.addEventListener('resize', checkScrollButtons);
      return () => {
        container.removeEventListener('scroll', checkScrollButtons);
        window.removeEventListener('resize', checkScrollButtons);
      };
    }
  }, [imageList]);

  const handleScroll = (direction) => {
    if (thumbnailsRef.current) {
      const scrollAmount = 100; // Scroll by thumbnail height
      thumbnailsRef.current.scrollBy({
        top: direction === 'up' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleThumbnailClick = (index) => {
    setCurrentIndex(index);
  };

  return (
    <div className="product-image-gallery-nike">
      {/* Side Thumbnails */}
      <div className="thumbnails-column">
        {showUpArrow && (
          <Button
            variant="outline"
            size="icon"
            className="thumbnail-scroll-btn up"
            onClick={() => handleScroll('up')}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
        )}
        
        <div className="thumbnails-scroll-container" ref={thumbnailsRef}>
          {imageList.map((image, index) => (
            <div
              key={index}
              className={`thumbnail-item ${index === currentIndex ? 'active' : ''}`}
              onClick={() => handleThumbnailClick(index)}
            >
              <img
                src={image}
                alt={`${productName} thumbnail ${index + 1}`}
                className="thumbnail-image"
              />
            </div>
          ))}
        </div>

        {showDownArrow && (
          <Button
            variant="outline"
            size="icon"
            className="thumbnail-scroll-btn down"
            onClick={() => handleScroll('down')}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Main Image */}
      <div className="main-image-container">
        <img
          src={imageList[currentIndex]}
          alt={`${productName} - Image ${currentIndex + 1}`}
          className="main-image"
        />
      </div>
    </div>
  );
};

export default ProductImageGallery;
