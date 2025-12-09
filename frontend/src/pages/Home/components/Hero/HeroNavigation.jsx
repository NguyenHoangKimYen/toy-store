import React from 'react';

const HeroNavigation = ({ onPrev, onNext, isMobile, showShopNow, onShopNow }) => {
  return (
    <div className="arrows">
      <button 
        id="hero-prev" 
        onClick={onPrev}
        aria-label="Previous slide"
      >
        &lt;
      </button>
      
      {isMobile && showShopNow && (
        <button className="cta-button mobile-shop-now" onClick={onShopNow}>
          Shop Now <span className="arrow">→</span>
        </button>
      )}
      
      <button 
        id="hero-next" 
        onClick={onNext}
        aria-label="Next slide"
      >
        &gt;
      </button>
    </div>
  );
};

export default HeroNavigation;
