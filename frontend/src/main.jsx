import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initAPIPreconnect } from './utils/prefetch'
import { initPerformanceTracking } from './utils/performance'
import { preconnectImageCDN } from './utils/imageOptimizer'

// Initialize API preconnection for faster requests
initAPIPreconnect();

// Preconnect to image CDN for faster image loading
preconnectImageCDN();

// Initialize performance monitoring (dev only)
initPerformanceTracking();

// Facebook đôi khi append "#_=_" vào redirect → loại bỏ để tránh hash lạ
if (window.location.hash === '#_=_') {
  const cleanUrl = window.location.href.replace(/#_=_$/, '');
  window.history.replaceState({}, document.title, cleanUrl);
}

// Clean up 'verified' param after email verification (but NOT 'token' - that's handled by AuthProvider)
(() => {
  const url = new URL(window.location.href);
  if (url.searchParams.has('verified')) {
    url.searchParams.delete('verified');
    const cleaned = url.origin + url.pathname + url.search + url.hash;
    window.history.replaceState({}, document.title, cleaned);
  }
})();

createRoot(document.getElementById('root')).render(
  <App />
);
