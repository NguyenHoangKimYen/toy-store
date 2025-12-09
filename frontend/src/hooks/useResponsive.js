import { useEffect, useState, useMemo } from 'react';

// Breakpoint constants for consistency across the app
export const BREAKPOINTS = {
  xs: 480,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export const useResponsive = () => {
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  useEffect(() => {
    let timeoutId = null;
    
    const handleResize = () => {
      // Debounce resize events for performance
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setWindowWidth(window.innerWidth);
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const breakpoints = useMemo(() => ({
    isMobile: windowWidth <= BREAKPOINTS.md - 1,  // < 768px
    isTablet: windowWidth >= BREAKPOINTS.md && windowWidth < BREAKPOINTS.lg,  // 768-1023px
    isDesktop: windowWidth >= BREAKPOINTS.lg,  // >= 1024px
    isSmallMobile: windowWidth < BREAKPOINTS.sm,  // < 640px
    isLargeDesktop: windowWidth >= BREAKPOINTS.xl,  // >= 1280px
    
    // Utility checks
    isTouchDevice: windowWidth < BREAKPOINTS.lg,
    windowWidth,
  }), [windowWidth]);

  return breakpoints;
};
