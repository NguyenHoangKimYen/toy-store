/**
 * Performance monitoring utilities
 * Tracks Core Web Vitals and custom metrics silently
 */

// Track page load performance
export const trackPageLoad = () => {
  // Disabled - no console output
};

// Track component render time
export const trackComponentRender = (componentName, callback) => {
  return callback();
};

// Track route change performance
export const trackRouteChange = () => {
  return () => {
    // Disabled - no console output
  };
};

// Track API call performance
export const trackAPICall = async (_apiName, apiCall) => {
  return await apiCall();
};

// Get current bundle size info
export const getBundleInfo = () => {
  // Disabled - no console output
};

// Initialize performance tracking (call in main.jsx)
export const initPerformanceTracking = () => {
  // All performance tracking disabled
};
