import { API_BASE_URL, ENDPOINTS } from './config';
import { handleResponse, createUrl } from '../utils/apiHelpers';
import { getAuthHeaders } from '../utils/authHelpers';

// Mock data
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

const MOCK_ORDERS = [
  {
    _id: 'order-001',
    orderNumber: 'ORD-2024-001',
    userId: 'mock-user-id',
    items: [
      {
        product: {
          _id: 'prod-1',
          name: 'Cute Bear Keychain',
          imageUrls: ['https://images.unsplash.com/photo-1530325553241-4f6e7690cf36?w=400'],
          minPrice: 400000,
        },
        quantity: 2,
        price: 400000,
      },
      {
        product: {
          _id: 'prod-2',
          name: 'Teddy Bear Plush',
          imageUrls: ['https://images.unsplash.com/photo-1551057748-6d85f0389e7b?w=400'],
          minPrice: 750000,
        },
        quantity: 1,
        price: 750000,
      },
    ],
    shippingAddress: {
      fullName: 'John Doe',
      addressLine: '123 Main Street, Apt 4B',
      city: 'New York',
      postalCode: '10001',
      phone: '+1 234-567-8900',
    },
    subtotal: 1550000,
    shippingFee: 50000,
    tax: 155000,
    totalAmount: 1755000,
    status: 'delivered',
    paymentMethod: 'credit_card',
    createdAt: new Date('2024-11-01').toISOString(),
    updatedAt: new Date('2024-11-10').toISOString(),
  },
  {
    _id: 'order-002',
    orderNumber: 'ORD-2024-002',
    userId: 'mock-user-id',
    items: [
      {
        product: {
          _id: 'prod-3',
          name: 'Rainbow Unicorn Plush',
          imageUrls: ['https://images.unsplash.com/photo-1566004100631-35d015d6a491?w=400'],
          minPrice: 875000,
        },
        quantity: 1,
        price: 875000,
      },
    ],
    shippingAddress: {
      fullName: 'John Doe',
      addressLine: '123 Main Street, Apt 4B',
      city: 'New York',
      postalCode: '10001',
      phone: '+1 234-567-8900',
    },
    subtotal: 875000,
    shippingFee: 50000,
    tax: 87500,
    totalAmount: 1012500,
    status: 'shipped',
    paymentMethod: 'paypal',
    createdAt: new Date('2024-11-10').toISOString(),
    updatedAt: new Date('2024-11-12').toISOString(),
  },
  {
    _id: 'order-003',
    orderNumber: 'ORD-2024-003',
    userId: 'mock-user-id',
    items: [
      {
        product: {
          _id: 'prod-4',
          name: 'Star Keychain Set',
          imageUrls: ['https://images.unsplash.com/photo-1583795128727-6ec3642408f8?w=400'],
          minPrice: 500000,
        },
        quantity: 3,
        price: 500000,
      },
    ],
    shippingAddress: {
      fullName: 'John Doe',
      addressLine: '456 Park Avenue',
      city: 'Brooklyn',
      postalCode: '11201',
      phone: '+1 234-567-8900',
    },
    subtotal: 1500000,
    shippingFee: 0,
    tax: 150000,
    totalAmount: 1650000,
    status: 'processing',
    paymentMethod: 'credit_card',
    createdAt: new Date('2024-11-13').toISOString(),
    updatedAt: new Date('2024-11-13').toISOString(),
  },
  {
    _id: 'order-004',
    orderNumber: 'ORD-2024-004',
    userId: 'mock-user-id',
    items: [
      {
        product: {
          _id: 'prod-5',
          name: 'Bunny Plush Toy',
          imageUrls: ['https://images.unsplash.com/photo-1585399000684-d2f72660f092?w=400'],
          minPrice: 625000,
        },
        quantity: 2,
        price: 625000,
      },
    ],
    shippingAddress: {
      fullName: 'John Doe',
      addressLine: '123 Main Street, Apt 4B',
      city: 'New York',
      postalCode: '10001',
      phone: '+1 234-567-8900',
    },
    subtotal: 1250000,
    shippingFee: 0,
    tax: 125000,
    totalAmount: 1375000,
    status: 'pending',
    paymentMethod: 'credit_card',
    createdAt: new Date('2024-11-14').toISOString(),
    updatedAt: new Date('2024-11-14').toISOString(),
  },
];

/**
 * Create a new order
 * @param {Object} orderData - Order information
 * @returns {Promise<Object>}
 */
export const createOrder = async (orderData) => {
  // MOCK START
  if (USE_MOCK_DATA) {
    console.log('🔧 ing mock data for order creation');
    
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
    console.log('🔧 ing mock data for orders', params);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Get orders from localStorage and merge with mock data
    const localOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    let orders = [...MOCK_ORDERS, ...localOrders];
    
    // Filter by status
    if (params.status && params.status !== 'all') {
      orders = orders.filter(order => 
        order.status.toLowerCase() === params.status.toLowerCase()
      );
    }
    
    // Search by order number or product name
    if (params.search) {
      const searchTerm = params.search.toLowerCase();
      orders = orders.filter(order => {
        const orderNumberMatch = order.orderNumber?.toLowerCase().includes(searchTerm);
        const productMatch = order.items.some(item => 
          item.product?.name?.toLowerCase().includes(searchTerm)
        );
        return orderNumberMatch || productMatch;
      });
    }
    
    // Sort orders
    if (params.sort) {
      const [field, order] = params.sort.split(':');
      orders.sort((a, b) => {
        let aVal, bVal;
        
        if (field === 'date') {
          aVal = new Date(a.createdAt).getTime();
          bVal = new Date(b.createdAt).getTime();
        } else if (field === 'total') {
          aVal = a.totalAmount;
          bVal = b.totalAmount;
        } else {
          return 0;
        }
        
        return order === 'desc' ? bVal - aVal : aVal - bVal;
      });
    } else {
      // Default sort by date descending
      orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    
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
    console.log('🔧 ing mock data for order detail');
    
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
    console.log('🔧 ing mock data for order status update');
    
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
