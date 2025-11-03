import { API_BASE_URL, ENDPOINTS } from './config';
import { handleResponse, createUrl } from './utils/apiHelpers';
import { getAuthHeaders } from './utils/authHelpers';

/**
 * Optional filters
 * @param {Object} params - Query parameters
 * @param {string} params.search - Search query
 * @param {string} params.role - Filter by role (admin/user)
 * @param {string} params.verified - Filter by verification status
 * @param {string} params.sortBy - Sort field
 * @param {string} params.sortOrder - Sort order (asc/desc)
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @returns {Promise<{users: Array, stats: Object, pagination: Object}>}
 */
export const getUsers = async (params = {}) => {
  const url = createUrl(`${API_BASE_URL}${ENDPOINTS.USERS}`, params);
  
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
export const getUserById = async (id) => {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.USERS}/${id}`, {
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
 * @param {Object} userData
 * @returns {Promise<Object>}
 */
export const createUser = async (userData) => {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.USERS}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(userData),
  });
  
  return handleResponse(response);
};

/**
 * Update
 * @param {string} id
 * @param {Object} userData
 * @returns {Promise<Object>}
 */
export const updateUser = async (id, userData) => {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.USERS}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(userData),
  });
  
  return handleResponse(response);
};

/**
 * Patch
 * @param {string} id
 * @param {Object} userData
 * @returns {Promise<Object>}
 */
export const patchUser = async (id, userData) => {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.USERS}/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(userData),
  });
  
  return handleResponse(response);
};

/**
 * Delete
 * @param {string} id
 * @returns {Promise<Object>}
 */
export const deleteUser = async (id) => {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.USERS}/${id}`, {
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
export const bulkDeleteUsers = async (ids) => {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.USERS}/bulk-delete`, {
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
 * Update verification status
 * @param {string}
 * @param {boolean} verified
 * @returns {Promise<Object>}
 */
export const updateUserVerification = async (id, verified) => {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.USERS}/${id}/verify`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ verified }),
  });
  
  return handleResponse(response);
};

/**
 * Update role
 * @param {string} id
 * @param {string} role
 * @returns {Promise<Object>}
 */
export const updateUserRole = async (id, role) => {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.USERS}/${id}/role`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ role }),
  });
  
  return handleResponse(response);
};

/**
 * Update loyalty points
 * @param {string} id
 * @param {number} points
 * @returns {Promise<Object>} 
 */
export const updateUserPoints = async (id, points) => {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.USERS}/${id}/points`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ points }),
  });
  
  return handleResponse(response);
};

/**
 * Get activity history
 * @param {string} id
 * @param {Object} params
 * @returns {Promise<Array>}
 */
export const getUserActivity = async (id, params = {}) => {
  const url = createUrl(`${API_BASE_URL}${ENDPOINTS.USERS}/${id}/activity`, params);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  });
  
  return handleResponse(response);
};
