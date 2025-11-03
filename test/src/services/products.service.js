import { API_BASE_URL, ENDPOINTS } from './config';
import { handleResponse, createUrl } from './utils/apiHelpers';
import { getAuthHeaders } from './utils/authHelpers';

/**
 * Optional filters
 * @param {Object} params - Query parameters
 * @param {string} params.search - Search query
 * @param {string} params.category - Filter by category
 * @param {string} params.status - Filter by status (active/draft/archived)
 * @param {string} params.sortBy - Sort field
 * @param {string} params.sortOrder - Sort order (asc/desc)
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @returns {Promise<{products: Array, stats: Object, pagination: Object}>}
 */
export const getProducts = async (params = {}) => {
  const url = createUrl(`${API_BASE_URL}${ENDPOINTS.PRODUCTS}`, params);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  });
  
  return handleResponse(response);
};

/**
 * Get
 * @param {string} id
 * @returns {Promise<Object>}
 */
export const getProductById = async (id) => {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.PRODUCTS}/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  });
  
  return handleResponse(response);
};

/**
 * Create
 * @param {Object} productData
 * @returns {Promise<Object>}
 */
export const createProduct = async (productData) => {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.PRODUCTS}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(productData),
  });
  
  return handleResponse(response);
};

/**
 * Update
 * @param {string} id
 * @param {Object} productData
 * @returns {Promise<Object>}
 */
export const updateProduct = async (id, productData) => {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.PRODUCTS}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(productData),
  });
  
  return handleResponse(response);
};

/**
 * Patch
 * @param {string} id
 * @param {Object} productData
 * @returns {Promise<Object>}
 */
export const patchProduct = async (id, productData) => {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.PRODUCTS}/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(productData),
  });
  
  return handleResponse(response);
};

/**
 * Delete
 * @param {string} id
 * @returns {Promise<Object>}
 */
export const deleteProduct = async (id) => {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.PRODUCTS}/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  });
  
  return handleResponse(response);
};

/**
 * Delete many
 * @param {Array<string>} ids
 * @returns {Promise<Object>}
 */
export const bulkDeleteProducts = async (ids) => {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.PRODUCTS}/bulk-delete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ ids }),
  });
  
  return handleResponse(response);
};

/**
 * Upload product images
 * @param {string} productId
 * @param {FormData} formData
 * @returns {Promise<Object>}
 */
export const uploadProductImages = async (productId, formData) => {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.PRODUCTS}/${productId}/images`, {
    method: 'POST',
    headers: {
      // Don't set Content-Type for FormData, browser will set it with boundary
      ...getAuthHeaders(),
    },
    body: formData,
  });
  
  return handleResponse(response);
};

/**
 * Delete a product image
 * @param {string} productId
 * @param {string} imageId
 * @returns {Promise<Object>}
 */
export const deleteProductImage = async (productId, imageId) => {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.PRODUCTS}/${productId}/images/${imageId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  });
  
  return handleResponse(response);
};

/**
 * Get categories
 * @returns {Promise<Array>}
 */
export const getProductCategories = async () => {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.PRODUCTS}/categories`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  });
  
  return handleResponse(response);
};
