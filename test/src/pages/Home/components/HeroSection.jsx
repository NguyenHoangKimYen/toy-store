import React, { useEffect } from 'react';
import './HeroSection.css';

const HeroSection = ({ featuredProducts }) => {
  useEffect(() => {
    let nextButton = document.getElementById('hero-next');
    let prevButton = document.getElementById('hero-prev');
    let carousel = document.querySelector('.hero-carousel');
    let listHTML = document.querySelector('.hero-carousel .list');
    let unAcceptClick;

    if (!nextButton || !prevButton || !carousel || !listHTML) return;

    const showSlider = (type) => {
      nextButton.style.pointerEvents = 'none';
      prevButton.style.pointerEvents = 'none';

      carousel.classList.remove('next', 'prev');
      let items = document.querySelectorAll('.hero-carousel .list .item');
      
      if (type === 'next') {
        listHTML.appendChild(items[0]);
        carousel.classList.add('next');
      } else {
        listHTML.prepend(items[items.length - 1]);
        carousel.classList.add('prev');
      }
      
      clearTimeout(unAcceptClick);
      unAcceptClick = setTimeout(() => {
        nextButton.style.pointerEvents = 'auto';
        prevButton.style.pointerEvents = 'auto';
      }, 2000);
    };

    nextButton.onclick = function() {
      showSlider('next');
    };
    
    prevButton.onclick = function() {
      showSlider('prev');
    };

    // Auto-play
    const autoPlay = setInterval(() => {
      showSlider('next');
    }, 5000);

    return () => {
      clearInterval(autoPlay);
    };
  }, [featuredProducts]);

  if (!featuredProducts || featuredProducts.length === 0) {
    return null;
  }

  return (
    <div className="hero-carousel">
      <div className="list">
        {featuredProducts.slice(0, 6).map((product) => (
          <div className="item" key={product._id}>
            <img 
              src={product.imageUrls?.[0] || '/placeholder.png'} 
              alt={product.name} 
            />
            <div className="introduce">
              <div className="title">FEATURED</div>
              <div className="topic">{product.name}</div>
              <div className="des">{product.description}</div>
              <div className="price-section">
                <span className="hero-price">
                  ${(product.price?.$numberDecimal || product.price)?.toLocaleString()}
                </span>
                {product.originalPrice && (
                  <span className="hero-original-price">
                    ${(product.originalPrice?.$numberDecimal || product.originalPrice)?.toLocaleString()}
                  </span>
                )}
              </div>
              <button className="cta-button">
                Shop Now <span className="arrow">→</span>
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="arrows">
        <button id="hero-prev" aria-label="Previous slide">&lt;</button>
        <button id="hero-next" aria-label="Next slide">&gt;</button>
      </div>
    </div>
  );
};

export default HeroSection;
