import React, { useEffect } from 'react';
import { carouselData } from './carouselData';
import './ProductCarousel.css';

const ProductCarousel = () => {
  useEffect(() => {
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
  }, []);

  return (
    <div className="carousel">
      <div className="list">
        {carouselData.map((item) => (
          <div className="item" key={item.id}>
            <img src={item.image} alt={item.topic} />
            <div className="introduce">
              <div className="title">{item.title}</div>
              <div className="topic">{item.topic}</div>
              <div className="des">{item.description}</div>
              <button className="seeMore">SEE MORE &#8599;</button>
            </div>
            <div className="detail">
              <div className="title">{item.detailTitle}</div>
              <div className="des">{item.detailDescription}</div>
              <div className="specifications">
                {item.specifications.map((spec, index) => (
                  <div key={index}>
                    <p>{spec.label}</p>
                    <p>{spec.value}</p>
                  </div>
                ))}
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
