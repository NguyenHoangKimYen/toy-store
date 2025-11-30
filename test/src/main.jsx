import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initAPIPreconnect } from './utils/prefetch'
import { initPerformanceTracking } from './utils/performance'

// Initialize API preconnection for faster requests
initAPIPreconnect();

// Initialize performance monitoring (dev only)
initPerformanceTracking();

// Facebook đôi khi append "#_=_" vào redirect → loại bỏ để tránh hash lạ
if (window.location.hash === '#_=_') {
  const cleanUrl = window.location.href.replace(/#_=_$/, '');
  window.history.replaceState({}, document.title, cleanUrl);
}

// Nếu có tham số verified/token sau xác thực email, xóa khỏi URL để người dùng không thấy
(() => {
  const url = new URL(window.location.href);
  const hasSensitiveParams =
    url.searchParams.has('verified') || url.searchParams.has('token');
  if (hasSensitiveParams) {
    url.searchParams.delete('verified');
    url.searchParams.delete('token');
    const cleaned = url.origin + url.pathname + url.hash;
    window.history.replaceState({}, document.title, cleaned);
  }
})();

createRoot(document.getElementById('root')).render(
  <App />
);
