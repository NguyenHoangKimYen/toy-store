import React, { useState, useEffect, useRef } from 'react';
import './StickyHeader.css';

/**
 * Sticky header that hides on scroll down and shows on scroll up
 */
const StickyHeader = ({ children, className = '' }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isSticky, setIsSticky] = useState(false);
  const lastScrollY = useRef(0);
  const headerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Determine if we should show or hide the header
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        // Scrolling down & past threshold
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY.current) {
        // Scrolling up
        setIsVisible(true);
      }

      // Determine if header should be in sticky mode
      setIsSticky(currentScrollY > 20);

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      ref={headerRef}
      className={`sticky-header ${isVisible ? 'visible' : 'hidden'} ${isSticky ? 'sticky' : ''} ${className}`}
    >
      {children}
    </div>
  );
};

export default StickyHeader;
