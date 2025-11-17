import { API_BASE_URL, ENDPOINTS } from './config';
import { handleResponse } from '../utils/apiHelpers';
import { getAuthHeaders } from '../utils/authHelpers';

/**
 * Get all categories
 * @returns {Promise<Array>}
 */
export const getCategories = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.CATEGORIES}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });
    
    const data = await handleResponse(response);
    
    // Handle different response formats
    // If data is wrapped in a 'categories' property
    if (data && data.categories) {
      return Array.isArray(data.categories) ? data.categories : [];
    }
    
    // If data is wrapped in a 'data' property
    if (data && data.data) {
      return Array.isArray(data.data) ? data.data : [];
    }
    
    // If data is already an array
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Categories service error:', error);
    console.error('Request URL:', `${API_BASE_URL}${ENDPOINTS.CATEGORIES}`);
    throw error;
  }
};

/**
 * Get a single category by ID
 * @param {string} id - Category ID
 * @returns {Promise<Object>}
 */
export const getCategoryById = async (id) => {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.CATEGORIES}/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  });
  
  return handleResponse(response);
};

/**
 * Get category by slug
 * @param {string} slug - Category slug
 * @returns {Promise<Object>}
 */
export const getCategoryBySlug = async (slug) => {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.CATEGORIES}/slug/${slug}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  });
  
  return handleResponse(response);
};

/**
 * Create a new category
 * @param {Object} categoryData - Category data
 * @returns {Promise<Object>}
 */
export const createCategory = async (categoryData) => {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.CATEGORIES}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(categoryData),
  });
  
  return handleResponse(response);
};

/**
 * Update a category
 * @param {string} id - Category ID
 * @param {Object} categoryData - Category data
 * @returns {Promise<Object>}
 */
export const updateCategory = async (id, categoryData) => {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.CATEGORIES}/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(categoryData),
  });
  
  return handleResponse(response);
};

/**
 * Delete a category
 * @param {string} id - Category ID
 * @returns {Promise<Object>}
 */
export const deleteCategory = async (id) => {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.CATEGORIES}/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  });
  
  return handleResponse(response);
};
