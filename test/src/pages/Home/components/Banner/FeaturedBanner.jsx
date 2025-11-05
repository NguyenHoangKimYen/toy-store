import React from 'react';
import { Sparkles, TrendingUp, Gift } from 'lucide-react';
import './FeaturedBanner.css';

const FeaturedBanner = () => {
  return (
    <div className="featured-banner">
      <div className="banner-content">
        <div className="banner-item">
          <div className="icon-wrapper">
            <Sparkles className="banner-icon" />
          </div>
          <div className="banner-text">
            <h3>Premium Quality</h3>
            <p>Handpicked products</p>
          </div>
        </div>

        <div className="banner-item">
          <div className="icon-wrapper">
            <TrendingUp className="banner-icon" />
          </div>
          <div className="banner-text">
            <h3>Trending Now</h3>
            <p>Most popular items</p>
          </div>
        </div>

        <div className="banner-item">
          <div className="icon-wrapper">
            <Gift className="banner-icon" />
          </div>
          <div className="banner-text">
            <h3>Perfect Gifts</h3>
            <p>For every occasion</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedBanner;
