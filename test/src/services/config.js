export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://milkybloom.us-east-1.elasticbeanstalk.com';

// API Endpoints
export const ENDPOINTS = {
  PRODUCTS: '/api/products',
  USERS: '/api/users',
  AUTH: '/api/auth',
  ORDERS: '/api/orders',
  CART: '/api/cart',
  CATEGORIES: '/api/categories',
};

// Default
export const getDefaultHeaders = () => ({
  'Content-Type': 'application/json',

});

export const REQUEST_TIMEOUT = 20000;
