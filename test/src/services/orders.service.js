import { API_BASE_URL, ENDPOINTS } from './config';
import { handleResponse, createUrl } from '../utils/apiHelpers';
import { getAuthHeaders } from '../utils/authHelpers';

// Mock data
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

/**
 * Create a new order
 * @param {Object} orderData - Order information
 * @returns {Promise<Object>}
 */
export const createOrder = async (orderData) => {
  // MOCK START
  if (USE_MOCK_DATA) {
    console.log('🔧 Using mock data for order creation');
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Create mock order
    const mockOrder = {
      _id: `order-${Date.now()}`,
      userId: 'mock-user-id',
      items: orderData.items,
      shippingInfo: orderData.shippingInfo,
      paymentMethod: orderData.paymentMethod,
      subtotal: orderData.subtotal,
      shipping: orderData.shipping,
      tax: orderData.tax,
      totalAmount: orderData.total,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Store in localStorage for orders page
    const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    existingOrders.push(mockOrder);
    localStorage.setItem('orders', JSON.stringify(existingOrders));
    
    return mockOrder;
  }
  // MOCK END

  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.ORDERS}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(orderData),
  });
  
  return handleResponse(response);
};

/**
 * Get user orders
 * @param {Object} params - Query parameters
 * @returns {Promise<Array>}
 */
export const getOrders = async (params = {}) => {
  // MOCK START
  if (USE_MOCK_DATA) {
    console.log('🔧 Using mock data for orders');
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Get orders from localStorage
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    
    return orders;
  }
  // MOCK END

  const url = createUrl(`${API_BASE_URL}${ENDPOINTS.ORDERS}`, params);
  
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
 * Get order by ID
 * @param {string} id - Order ID
 * @returns {Promise<Object>}
 */
export const getOrderById = async (id) => {
  // MOCK START
  if (USE_MOCK_DATA) {
    console.log('🔧 Using mock data for order detail');
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Get orders from localStorage
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const order = orders.find(o => o._id === id);
    
    if (!order) {
      throw new Error('Order not found');
    }
    
    return order;
  }
  // MOCK END

  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.ORDERS}/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  });
  
  return handleResponse(response);
};

/**
 * Update order status
 * @param {string} id - Order ID
 * @param {string} status - New status
 * @returns {Promise<Object>}
 */
export const updateOrderStatus = async (id, status) => {
  // MOCK START
  if (USE_MOCK_DATA) {
    console.log('🔧 Using mock data for order status update');
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Update order in localStorage
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const orderIndex = orders.findIndex(o => o._id === id);
    
    if (orderIndex === -1) {
      throw new Error('Order not found');
    }
    
    orders[orderIndex].status = status;
    orders[orderIndex].updatedAt = new Date().toISOString();
    localStorage.setItem('orders', JSON.stringify(orders));
    
    return orders[orderIndex];
  }
  // MOCK END

  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.ORDERS}/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ status }),
  });
  
  return handleResponse(response);
};

/**
 * Cancel order
 * @param {string} id - Order ID
 * @returns {Promise<Object>}
 */
export const cancelOrder = async (id) => {
  return updateOrderStatus(id, 'cancelled');
};
