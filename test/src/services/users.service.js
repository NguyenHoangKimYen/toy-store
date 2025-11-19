import { API_BASE_URL, ENDPOINTS } from './config';
import { handleResponse, createUrl } from '../utils/apiHelpers';
import { getAuthHeaders } from '../utils/authHelpers';

/**
 * Get all users with optional filters
 * @param {Object} params - Query parameters
 * @param {string} params.search - Search query
 * @param {string} params.role - Filter by role (admin/customer)
 * @param {string} params.isVerified - Filter by verification status
 * @param {string} params.socialProvider - Filter by social login provider
 * @param {string} params.sortBy - Sort field
 * @param {string} params.sortOrder - Sort order (asc/desc)
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @returns {Promise<Array>}
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
 * Get user by ID
 * @param {string} id - User ID
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
 * Get user by email
 * @param {string} email - User email
 * @returns {Promise<Object>}
 */
export const getUserByEmail = async (email) => {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.USERS}/email/${email}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  });
  
  return handleResponse(response);
};

/**
 * Get user by phone
 * @param {string} phone - User phone number
 * @returns {Promise<Object>}
 */
export const getUserByPhone = async (phone) => {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.USERS}/phone/${encodeURIComponent(phone)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  });
  
  return handleResponse(response);
};

/**
 * Get user by username
 * @param {string} username - Username
 * @returns {Promise<Object>}
 */
export const getUserByUsername = async (username) => {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.USERS}/username/${username}`, {
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
 * Verify user account
 * @param {string} id - User ID
 * @param {string} token - Verification token
 * @returns {Promise<Object>}
 */
export const verifyUser = async (id, token) => {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.USERS}/${id}/verify`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ token }),
  });
  
  return handleResponse(response);
};

/**
 * Set user password
 * @param {string} id - User ID
 * @param {string} password - New password
 * @param {string} confirmPassword - Password confirmation
 * @returns {Promise<Object>}
 */
export const setUserPassword = async (id, password, confirmPassword) => {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.USERS}/${id}/set-password`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ password, confirmPassword }),
  });
  
  return handleResponse(response);
};

/**
 * Upload user avatar
 * @param {string} id - User ID
 * @param {File} file - Avatar image file
 * @returns {Promise<Object>}
 */
export const uploadAvatar = async (id, file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.USERS}/${id}/avatar`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
    },
    body: formData,
  });
  
  return handleResponse(response);
};

/**
 * Update user avatar
 * @param {string} id - User ID
 * @param {File} file - New avatar image file
 * @returns {Promise<Object>}
 */
export const updateAvatar = async (id, file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.USERS}/${id}/avatar`, {
    method: 'PATCH',
    headers: {
      ...getAuthHeaders(),
    },
    body: formData,
  });
  
  return handleResponse(response);
};
