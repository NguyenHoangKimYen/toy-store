import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AppRoutes from './routes/AppRoutes'
import { AuthProvider } from './hooks/useAuth'
import { initAPIPreconnect } from './utils/prefetch'

// Initialize API preconnection for faster requests
initAPIPreconnect();

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
