import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './ScrollArrows.css';

const ScrollArrows = ({ onScrollLeft, onScrollRight, className = '' }) => {
  return (
    <>
      {/* Left Arrow */}
      <button
        onClick={onScrollLeft}
        className={`scroll-arrow scroll-arrow-left ${className}`}
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      {/* Right Arrow */}
      <button
        onClick={onScrollRight}
        className={`scroll-arrow scroll-arrow-right ${className}`}
        aria-label="Scroll right"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </>
  );
};

export default ScrollArrows;
