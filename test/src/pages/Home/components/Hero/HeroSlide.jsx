import React from 'react';
import { useNavigate } from 'react-router-dom';

const HeroSlide = ({ product, isFirst = false }) => {
  const navigate = useNavigate();

  const handleShopNow = () => {
    navigate(`/products/${product._id}`);
  };

  // Use first image from product imageUrls array, fallback to placeholder
  const productImage = product.imageUrls && product.imageUrls.length > 0 
    ? product.imageUrls[0] 
    : '/placeholder.png';

  // Truncate description for mobile
  const truncatedDescription = product.description && product.description.length > 100
    ? product.description.substring(0, 100) + '...'
    : product.description;

  return (
    <div className="item">
      <img 
        src={productImage} 
        alt={product.name} 
        loading={isFirst ? "eager" : "lazy"}
        fetchPriority={isFirst ? "high" : "auto"}
      />
      <div className="introduce">
        <div className="tag">Top Picks</div>
        <div className="name">{product.name || 'Featured Product'}</div>
        <div className="des">{truncatedDescription}</div>
        <button className="cta-button" onClick={handleShopNow}>
          Shop Now <span className="arrow">→</span>
        </button>
      </div>
    </div>
  );
};

export default HeroSlide;
