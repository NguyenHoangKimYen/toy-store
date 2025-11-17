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
