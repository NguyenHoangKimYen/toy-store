/**
 * Performance monitoring utilities
 * Tracks Core Web Vitals and custom metrics
 */

// Track page load performance
export const trackPageLoad = () => {
  if (typeof window === 'undefined') return;

  window.addEventListener('load', () => {
    // Get navigation timing
    const perfData = performance.getEntriesByType('navigation')[0];
    
    if (perfData) {
      console.log('📊 Performance Metrics:');
      console.log(`⚡ Time to Interactive: ${Math.round(perfData.domInteractive)}ms`);
      console.log(`🎨 DOM Content Loaded: ${Math.round(perfData.domContentLoadedEventEnd)}ms`);
      console.log(`✅ Page Fully Loaded: ${Math.round(perfData.loadEventEnd)}ms`);
      console.log(`📦 Total Transfer Size: ${Math.round(perfData.transferSize / 1024)}KB`);
    }

    // Track Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          console.log(`🖼️ Largest Contentful Paint: ${Math.round(lastEntry.renderTime || lastEntry.loadTime)}ms`);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        // LCP not supported
      }

      // Track First Input Delay (FID)
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            console.log(`⚡ First Input Delay: ${Math.round(entry.processingStart - entry.startTime)}ms`);
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        // FID not supported
      }

      // Track Cumulative Layout Shift (CLS)
      let clsScore = 0;
      try {
        const clsObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (!entry.hadRecentInput) {
              clsScore += entry.value;
              console.log(`📐 Cumulative Layout Shift: ${clsScore.toFixed(4)}`);
            }
          });
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        // CLS not supported
      }
    }
  });
};

// Track component render time
export const trackComponentRender = (componentName, callback) => {
  const startTime = performance.now();
  const result = callback();
  const endTime = performance.now();
  const renderTime = endTime - startTime;
  
  if (renderTime > 16) { // Slower than 60fps
    console.warn(`⚠️ Slow render: ${componentName} took ${renderTime.toFixed(2)}ms`);
  }
  
  return result;
};

// Track route change performance
export const trackRouteChange = (routeName) => {
  const startMark = `route-${routeName}-start`;
  const endMark = `route-${routeName}-end`;
  
  performance.mark(startMark);
  
  return () => {
    performance.mark(endMark);
    performance.measure(`Route: ${routeName}`, startMark, endMark);
    
    const measure = performance.getEntriesByName(`Route: ${routeName}`)[0];
    console.log(`🚀 Route ${routeName} loaded in ${Math.round(measure.duration)}ms`);
  };
};

// Track API call performance
export const trackAPICall = async (apiName, apiCall) => {
  const startTime = performance.now();
  
  try {
    const result = await apiCall();
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`🌐 API ${apiName}: ${Math.round(duration)}ms`);
    
    return result;
  } catch (error) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.error(`❌ API ${apiName} failed after ${Math.round(duration)}ms:`, error);
    throw error;
  }
};

// Get current bundle size info
export const getBundleInfo = () => {
  if (typeof window === 'undefined') return;

  const resources = performance.getEntriesByType('resource');
  
  let jsSize = 0;
  let cssSize = 0;
  let imageSize = 0;
  let totalSize = 0;

  resources.forEach((resource) => {
    const size = resource.transferSize || 0;
    totalSize += size;

    if (resource.name.endsWith('.js')) {
      jsSize += size;
    } else if (resource.name.endsWith('.css')) {
      cssSize += size;
    } else if (/\.(jpg|jpeg|png|gif|webp|svg)/.test(resource.name)) {
      imageSize += size;
    }
  });

  console.log('📦 Bundle Sizes:');
  console.log(`  JavaScript: ${Math.round(jsSize / 1024)}KB`);
  console.log(`  CSS: ${Math.round(cssSize / 1024)}KB`);
  console.log(`  Images: ${Math.round(imageSize / 1024)}KB`);
  console.log(`  Total: ${Math.round(totalSize / 1024)}KB`);
};

// Initialize performance tracking (call in main.jsx)
export const initPerformanceTracking = () => {
  if (import.meta.env.DEV) {
    trackPageLoad();
    
    // Log bundle info after page load
    window.addEventListener('load', () => {
      setTimeout(getBundleInfo, 1000);
    });
  }
};
