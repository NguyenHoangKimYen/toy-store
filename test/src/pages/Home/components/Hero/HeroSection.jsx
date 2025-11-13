import React, { useEffect, useRef } from 'react';
import HeroSlide from './HeroSlide';
import HeroNavigation from './HeroNavigation';
import { useCarouselAutoplay, useCarouselNavigation, useResponsive } from '@/hooks';
import { mockProducts } from '../../data/mockProducts';
import './HeroSection.css';
import example from '../../../../assets/example.png';

const HeroSection = ({ featuredProducts }) => {
  const carouselRef = useRef(null);
  const listRef = useRef(null);
  
  // Use mock data if featuredProducts is empty
  const displayProducts = (featuredProducts && featuredProducts.length > 0) 
    ? featuredProducts 
    : mockProducts.featured;
  
  const { direction, triggerSlide, goToNext, goToPrev } = useCarouselNavigation();
  const { reset: resetAutoPlay } = useCarouselAutoplay(5000);
  const { isMobile } = useResponsive();

  // Handle CSS class animation and DOM reordering
  useEffect(() => {
    if (!carouselRef.current || !listRef.current || !direction) return;

    const carousel = carouselRef.current;
    const list = listRef.current;
    const items = list.querySelectorAll('.item');

    if (items.length === 0) return;

    // Remove previous classes
    carousel.classList.remove('next', 'prev');

    // Reorder DOM based on direction
    if (direction === 'next') {
      list.appendChild(items[0]);
      carousel.classList.add('next');
    } else if (direction === 'prev') {
      list.prepend(items[items.length - 1]);
      carousel.classList.add('prev');
    }
  }, [triggerSlide, direction]);

  // Auto-play
  useEffect(() => {
    resetAutoPlay(goToNext);
  }, [goToNext, resetAutoPlay]);

  const handleNext = () => {
    goToNext();
    resetAutoPlay(goToNext);
  };

  const handlePrev = () => {
    goToPrev();
    resetAutoPlay(goToNext);
  };

  if (!displayProducts || displayProducts.length === 0) {
    return null;
  }

  return (
    <div className="hero-carousel" ref={carouselRef}>
      <div className="list" ref={listRef}>
        {displayProducts.slice(0, 6).map((product) => (
          <HeroSlide 
            key={product._id} 
            product={product} 
            image={example}
          />
        ))}
      </div>
      
      <HeroNavigation 
        onPrev={handlePrev}
        onNext={handleNext}
        isMobile={isMobile}
        showShopNow={true}
      />
    </div>
  );
};

export default HeroSection;
