export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://milkybloomtoystore.id.vn/api';

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

export const REQUEST_TIMEOUT = 20000;

// API Client
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
    const token = localStorage.getItem('token');
    const defaultHeaders = {
      ...getDefaultHeaders(),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...headers,
    };

    const config = {
      method,
      headers: defaultHeaders,
      ...fetchOptions,
    };

    if (data) {
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(fullUrl, config);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: `HTTP error! status: ${response.status}`,
        }));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('API request failed:', error);
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
