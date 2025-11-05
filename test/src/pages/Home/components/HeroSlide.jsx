import React from 'react';

const HeroSlide = ({ product, image }) => {
  return (
    <div className="item">
      <img src={image} alt={product.name} />
      <div className="introduce">
        <div className="tag">FEATURED</div>
        <div className="name">{product.name}</div>
        <div className="des">{product.description}</div>
        <button className="cta-button">
          Shop Now <span className="arrow">→</span>
        </button>
      </div>
    </div>
  );
};

export default HeroSlide;
