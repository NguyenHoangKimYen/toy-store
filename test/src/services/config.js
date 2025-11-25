export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.milkybloomtoystore.id.vn';

// API Endpoints
export const ENDPOINTS = {
  PRODUCTS: '/products',
  USERS: '/users',
  AUTH: '/auth',
  ORDERS: '/orders',
  CART: '/cart',
  CATEGORIES: '/categories',
};

// Default
export const getDefaultHeaders = () => ({
  'Content-Type': 'application/json',
});

export const REQUEST_TIMEOUT = 15000; // Reduced from 20s to 15s for faster failure detection

// API Client with optimizations
const apiClient = {
  async request(method, url, options = {}) {
    const { data, params, headers = {}, ...fetchOptions } = options;
    
    // Build URL with query params
    let fullUrl = `${API_BASE_URL}${url}`;
    if (params) {
      const queryString = new URLSearchParams(params).toString();
      fullUrl += `?${queryString}`;
    }

    // Get auth token if exists
    const token = localStorage.getItem('authToken');
    
    // Get guest sessionId if user is not logged in
    const sessionId = !token ? localStorage.getItem('guestSessionId') : null;
    
    const defaultHeaders = {
      ...getDefaultHeaders(),
      'Connection': 'keep-alive', // Enable HTTP connection reuse
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(sessionId && { 'X-Session-Id': sessionId }),
      ...headers,
    };

    const config = {
      method,
      headers: defaultHeaders,
      keepalive: true, // Enable connection pooling
      ...fetchOptions,
    };

    if (data) {
      config.body = JSON.stringify(data);
    }

    try {
      // Add timeout
      const timeoutId = setTimeout(() => {
        throw new Error('Request timeout');
      }, REQUEST_TIMEOUT);

      const response = await fetch(fullUrl, config);
      clearTimeout(timeoutId);
      
      console.log('API Response Status:', response.status, 'URL:', fullUrl);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: `HTTP error! status: ${response.status}`,
        }));
        console.error('API Error Response:', error);
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('API Success Response:', result);
      return result;
    } catch (error) {
      // Don't log 404 errors (expected for non-existent carts)
      if (!error.message?.includes('404') && !error.message?.includes('Không tìm thấy')) {
        console.error('API request failed:', error);
      }
      throw error;
    }
  },

  get(url, options) {
    return this.request('GET', url, options);
  },

  post(url, data, options = {}) {
    return this.request('POST', url, { ...options, data });
  },

  put(url, data, options = {}) {
    return this.request('PUT', url, { ...options, data });
  },

  patch(url, data, options = {}) {
    return this.request('PATCH', url, { ...options, data });
  },

  delete(url, options) {
    return this.request('DELETE', url, options);
  },
};

export default apiClient;
