import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Scroll to top when navigating to a new page
 * This component should be placed inside the Router
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top with smooth behavior
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant', // Use 'instant' for immediate scroll on navigation
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
