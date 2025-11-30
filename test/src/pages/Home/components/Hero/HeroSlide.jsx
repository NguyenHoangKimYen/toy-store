import React from 'react';
import { useNavigate } from 'react-router-dom';

const HeroSlide = ({ product }) => {
  const navigate = useNavigate();

  const handleShopNow = () => {
    navigate(`/products/${product._id}`);
  };

  // Use first image from product imageUrls array, fallback to placeholder
  const productImage = product.imageUrls && product.imageUrls.length > 0 
    ? product.imageUrls[0] 
    : '/placeholder.png';

  return (
    <div className="item">
      <img src={productImage} alt={product.name} />
      <div className="introduce">
        <div className="tag">Top Picks</div>
        <div className="name">Pucky Hat Series</div>
        <div className="des">{product.description}</div>
        <button className="cta-button" onClick={handleShopNow}>
          Shop Now <span className="arrow">→</span>
        </button>
      </div>
    </div>
  );
};

export default HeroSlide;
