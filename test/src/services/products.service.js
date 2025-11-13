import { API_BASE_URL, ENDPOINTS } from './config';
import { handleResponse, createUrl } from './utils/apiHelpers';
import { getAuthHeaders } from './utils/authHelpers';


// MOCK START
// Mock data import
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';
let mockProducts = null;

// Lazy load mock data only when needed
const getMockProducts = async () => {
  if (!mockProducts) {
    const module = await import('../pages/Home/data/mockProducts');
    mockProducts = module.mockProducts;
  }
  return mockProducts;
};

// Helper to filter mock products based on params
const filterMockProducts = (products, params = {}) => {
  let filtered = [...products];

  // Apply category filter
  if (params.category) {
    filtered = filtered.filter(p => 
      p.categoryId?.name?.toLowerCase().includes(params.category.toLowerCase())
    );
  }

  // Apply featured filter
  if (params.isFeatured !== undefined) {
    filtered = filtered.filter(p => p.isFeatured === params.isFeatured);
  }

  // Apply new filter
  if (params.isNew !== undefined) {
    filtered = filtered.filter(p => p.isNew === params.isNew);
  }

  // Apply best seller filter
  if (params.isBestSeller !== undefined) {
    filtered = filtered.filter(p => p.isBestSeller === params.isBestSeller);
  }

  // Apply search filter
  if (params.search) {
    const searchLower = params.search.toLowerCase();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(searchLower) ||
      p.description?.toLowerCase().includes(searchLower)
    );
  }

  // Apply limit
  if (params.limit) {
    filtered = filtered.slice(0, parseInt(params.limit));
  }

  return filtered;
};

// MOCK END

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

  // MOCK START
  if (USE_MOCK_DATA) {
    console.log('🔧 Using mock data (VITE_USE_MOCK_DATA=true)');
    const mockData = await getMockProducts();
    
    // Combine all mock products
    const allProducts = [
      ...mockData.featured,
      ...mockData.newProducts,
      ...mockData.bestSellers,
      ...mockData.keychains,
      ...mockData.plushToys,
      ...mockData.accessories,
    ];

    // Remove duplicates by _id
    const uniqueProducts = Array.from(
      new Map(allProducts.map(p => [p._id, p])).values()
    );

    const filtered = filterMockProducts(uniqueProducts, params);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return filtered;
  }

  // MOCK END
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

// MOCK START
  if (USE_MOCK_DATA) {
    console.log('🔧 Using mock data (VITE_USE_MOCK_DATA=true)');
    const mockData = await getMockProducts();
    
    // Combine all mock products
    const allProducts = [
      ...mockData.featured,
      ...mockData.newProducts,
      ...mockData.bestSellers,
      ...mockData.keychains,
      ...mockData.plushToys,
      ...mockData.accessories,
    ];

    const product = allProducts.find(p => p._id === id);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (!product) {
      throw new Error('Product not found');
    }
    
    return product;
  }

// MOCK END

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

// MOCK START
  if (USE_MOCK_DATA) {
    const products = await getMockProducts();
    const categorySet = new Set();
    
    products.forEach(product => {
      if (product.categoryId?.name) {
        categorySet.add(product.categoryId.name);
      }
    });
    
    return Array.from(categorySet).map((name, index) => ({
      _id: `cat-${index + 1}`,
      name,
    }));
  }
// MOCK END

  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.PRODUCTS}/categories`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  });
  
  return handleResponse(response);
};

/**
 * Search products (alias for getProducts with search parameter)
 * @param {Object} params - Search parameters
 * @returns {Promise<{products: Array, pagination: Object}>}
 */
export const searchProducts = getProducts;
