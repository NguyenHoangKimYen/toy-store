import React, { useEffect, useState } from 'react';
import { getProducts } from '@/services/products.service';
import { formatPrice } from '@/utils/formatPrice';
import './ProductCarousel.css';

const ProductCarousel = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const data = await getProducts({ isFeatured: true, limit: 6 });
        setProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch featured products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  useEffect(() => {
    if (loading || products.length === 0) return;
    let nextButton = document.getElementById('next');
    let prevButton = document.getElementById('prev');
    let carousel = document.querySelector('.carousel');
    let listHTML = document.querySelector('.carousel .list');
    let seeMoreButtons = document.querySelectorAll('.seeMore');
    let backButton = document.getElementById('back');
    let unAcceptClick;

    const showSlider = (type) => {
      nextButton.style.pointerEvents = 'none';
      prevButton.style.pointerEvents = 'none';

      carousel.classList.remove('next', 'prev');
      let items = document.querySelectorAll('.carousel .list .item');
      
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

    seeMoreButtons.forEach((button) => {
      button.onclick = function() {
        carousel.classList.remove('next', 'prev');
        carousel.classList.add('showDetail');
      };
    });

    backButton.onclick = function() {
      carousel.classList.remove('showDetail');
    };
  }, [loading, products]);

  if (loading) {
    return (
      <div className="carousel-loading" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '800px',
        fontSize: '1.5rem',
        color: '#64748b'
      }}>
        Loading featured products...
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="carousel-loading" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '800px',
        fontSize: '1.5rem',
        color: '#64748b'
      }}>
        No featured products available
      </div>
    );
  }

  return (
    <div className="carousel">
      <div className="list">
        {products.map((product) => (
          <div className="item" key={product._id}>
            <img src={product.imageUrls?.[0] || '/placeholder.png'} alt={product.name} />
            <div className="introduce">
              <div className="title">FEATURED</div>
              <div className="topic">{product.name}</div>
              <div className="des">{product.description}</div>
              <button className="seeMore">SEE MORE &#8599;</button>
            </div>
            <div className="detail">
              <div className="title">{product.name}</div>
              <div className="des">{product.description}</div>
              <div className="specifications">
                <div>
                  <p>Price</p>
                  <p>{formatPrice(product.minPrice || product.price?.$numberDecimal || product.price)}</p>
                </div>
                <div>
                  <p>Stock</p>
                  <p>{product.stockQuantity}</p>
                </div>
                <div>
                  <p>Rating</p>
                  <p>{product.averageRating || 0} ⭐</p>
                </div>
                <div>
                  <p>Sold</p>
                  <p>{product.soldCount || 0}</p>
                </div>
              </div>
              <div className="checkout">
                <button>ADD TO CART</button>
                <button>CHECKOUT</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="arrows">
        <button id="prev">&lt;</button>
        <button id="next">&gt;</button>
        <button id="back">See All &#8599;</button>
      </div>
    </div>
  );
};

export default ProductCarousel;
