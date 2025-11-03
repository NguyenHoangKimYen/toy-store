/**
 * Get authentication token from storage
 * @returns {string|null} Auth token
 */
export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

/**
 * Set authentication token to storage
 * @param {string} token - Auth token
 */
export const setAuthToken = (token) => {
  localStorage.setItem('authToken', token);
};

/**
 * Remove authentication token from storage
 */
export const removeAuthToken = () => {
  localStorage.removeItem('authToken');
};

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return !!getAuthToken();
};

/**
 * Get authorization headers
 * @returns {Object} Headers with authorization
 */
export const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};
