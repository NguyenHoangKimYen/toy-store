import React from 'react';
import { useNavigate } from 'react-router-dom';

const HeroSlide = ({ product, image }) => {
  const navigate = useNavigate();

  const handleShopNow = () => {
    navigate(`/products/${product._id}`);
  };

  return (
    <div className="item">
      <img src={image} alt={product.name} />
      <div className="introduce">
        <div className="tag">FEATURED</div>
        <div className="name">{product.name}</div>
        <div className="des">{product.description}</div>
        <button className="cta-button" onClick={handleShopNow}>
          Shop Now <span className="arrow">→</span>
        </button>
      </div>
    </div>
  );
};

export default HeroSlide;
