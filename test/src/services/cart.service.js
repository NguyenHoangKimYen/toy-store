import { API_BASE_URL, ENDPOINTS } from './config';
import { handleResponse } from '../utils/apiHelpers';
import { getAuthHeaders } from '../utils/authHelpers';

// Mock data
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

// Helper to get mock products by IDs
const getMockProductsByIds = async (productIds) => {
  const { mockProducts } = await import('../pages/Home/data/mockProducts');
  
  const allProducts = [
    ...mockProducts.featured,
    ...mockProducts.newProducts,
    ...mockProducts.bestSellers,
    ...mockProducts.keychains,
    ...mockProducts.plushToys,
    ...mockProducts.accessories,
  ];

  // Remove duplicates
  const uniqueProducts = Array.from(
    new Map(allProducts.map(p => [p._id, p])).values()
  );

  return productIds.map(id => uniqueProducts.find(p => p._id === id)).filter(Boolean);
};

/**
 * Get user's cart
 * @returns {Promise<Array>}
 */
export const getCart = async () => {
  // MOCK START
  if (USE_MOCK_DATA) {
    console.log('🔧 Using mock data for cart');
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Get cart from localStorage
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Fetch product details for each cart item
    const productIds = cart.map(item => item.productId);
    const products = await getMockProductsByIds(productIds);
    
    // Combine cart items with product details
    const cartWithProducts = cart.map(item => {
      const product = products.find(p => p._id === item.productId);
      return {
        _id: item._id,
        productId: item.productId,
        quantity: item.quantity,
        product: product || null,
      };
    }).filter(item => item.product !== null); // Remove items with missing products
    
    return cartWithProducts;
  }
  // MOCK END

  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.CART}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  });
  
  return handleResponse(response);
};

/**
 * Add item to cart
 * @param {string} productId - Product ID
 * @param {number} quantity - Quantity
 * @returns {Promise<Object>}
 */
export const addToCart = async (productId, quantity = 1) => {
  // MOCK START
  if (USE_MOCK_DATA) {
    console.log('🔧 Using mock data for add to cart');
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Check if item already exists
    const existingIndex = cart.findIndex(item => item.productId === productId);
    
    if (existingIndex > -1) {
      // Update quantity
      cart[existingIndex].quantity += quantity;
    } else {
      // Add new item
      cart.push({
        _id: `cart-item-${Date.now()}`,
        productId,
        quantity,
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    
    return { success: true, message: 'Item added to cart' };
  }
  // MOCK END

  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.CART}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ productId, quantity }),
  });
  
  return handleResponse(response);
};

/**
 * Update cart item quantity
 * @param {string} itemId - Cart item ID
 * @param {number} quantity - New quantity
 * @returns {Promise<Object>}
 */
export const updateCartItem = async (itemId, quantity) => {
  // MOCK START
  if (USE_MOCK_DATA) {
    console.log('🔧 Using mock data for update cart item');
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const itemIndex = cart.findIndex(item => item._id === itemId);
    
    if (itemIndex === -1) {
      throw new Error('Cart item not found');
    }
    
    cart[itemIndex].quantity = quantity;
    localStorage.setItem('cart', JSON.stringify(cart));
    
    return { success: true, message: 'Cart updated' };
  }
  // MOCK END

  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.CART}/${itemId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ quantity }),
  });
  
  return handleResponse(response);
};

/**
 * Remove item from cart
 * @param {string} itemId - Cart item ID
 * @returns {Promise<Object>}
 */
export const removeFromCart = async (itemId) => {
  // MOCK START
  if (USE_MOCK_DATA) {
    console.log('🔧 Using mock data for remove from cart');
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const updatedCart = cart.filter(item => item._id !== itemId);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    
    return { success: true, message: 'Item removed from cart' };
  }
  // MOCK END

  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.CART}/${itemId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  });
  
  return handleResponse(response);
};

/**
 * Clear entire cart
 * @returns {Promise<Object>}
 */
export const clearCart = async () => {
  // MOCK START
  if (USE_MOCK_DATA) {
    console.log('🔧 Using mock data for clear cart');
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    localStorage.setItem('cart', JSON.stringify([]));
    
    return { success: true, message: 'Cart cleared' };
  }
  // MOCK END

  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.CART}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  });
  
  return handleResponse(response);
};
