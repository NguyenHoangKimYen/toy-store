/**
 * Handle API response and extract data
 * @param {Response} response - Fetch API response
 * @returns {Promise<any>} Parsed JSON data
 * @throws {Error} If response is not ok
 */
export const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ 
      message: 'An error occurred' 
    }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  const json = await response.json();
  
  // Handle different response formats
  if (json.success && json.data !== undefined) {
    return json.data;
  }
  
  // Handle paginated response format {products: [...], pagination: {...}}
  if (json.products !== undefined) {
    return json.products;
  }

  return json;
};

/**
 * Build query string from params object
 * @param {Object} params - Query parameters
 * @returns {string} Query string
 */
export const buildQueryString = (params) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, value);
    }
  });
  return query.toString();
};

/**
 * Create full URL with query parameters
 * @param {string} baseUrl - Base URL
 * @param {Object} params - Query parameters
 * @returns {string} Full URL with query string
 */
export const createUrl = (baseUrl, params = {}) => {
  const queryString = buildQueryString(params);
  return `${baseUrl}${queryString ? `?${queryString}` : ''}`;
};

/**
 * Handle fetch errors with timeout
 * @param {Promise} fetchPromise - Fetch promise
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<Response>}
 */
export const fetchWithTimeout = async (fetchPromise, timeout = 30000) => {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout')), timeout);
  });
  
  return Promise.race([fetchPromise, timeoutPromise]);
};
