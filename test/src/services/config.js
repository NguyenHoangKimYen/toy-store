export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// API Endpoints
export const ENDPOINTS = {
  PRODUCTS: '/products',
  USERS: '/users',
  AUTH: '/auth',
  ORDERS: '/orders',
  CATEGORIES: '/categories',
};

// Default
export const getDefaultHeaders = () => ({
  'Content-Type': 'application/json',

});

export const REQUEST_TIMEOUT = 20000;
