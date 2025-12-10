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
  // If response has pagination metadata (total, page, stats), return full structure
  if (json.success && json.data !== undefined) {
    // Check if this is a paginated response with metadata
    if (json.total !== undefined || json.stats !== undefined || json.totalPages !== undefined) {
      // Return object with data renamed to standard format + metadata
      return {
        users: json.data,      // For users endpoint
        products: json.data,   // For products endpoint  
        data: json.data,       // Generic
        total: json.total,
        page: json.page,
        limit: json.limit,
        totalPages: json.totalPages,
        stats: json.stats,
      };
    }
    return json.data;
  }
  
  // Return full response to preserve pagination metadata
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
