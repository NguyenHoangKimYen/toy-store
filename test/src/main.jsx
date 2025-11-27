import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AppRoutes from './routes/AppRoutes'
import { AuthProvider } from './context/AuthProvider'
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

// Start MSW when in development with mock data enabled
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

async function enableMocking() {
  if (!USE_MOCK_DATA) {
    return;
  }

  const { worker } = await import('./mocks');

  // `worker.start()` returns a Promise that resolves
  // once the Service Worker is up and ready to intercept requests.
  return worker.start({
    onUnhandledRequest: 'bypass', // Don't warn about unhandled requests
  });
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')).render(
    <AuthProvider>
      <App />
    </AuthProvider>
  );
});
