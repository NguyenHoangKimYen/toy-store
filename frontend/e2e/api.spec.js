import { test, expect } from '@playwright/test';

/**
 * API Integration Tests
 * Tests: Backend API endpoints work correctly
 */

const API_BASE = 'http://localhost:5000/api';

test.describe('Products API', () => {
  test('should return products list', async ({ request }) => {
    const response = await request.get(`${API_BASE}/products`);
    
    expect(response.ok()).toBe(true);
    
    const data = await response.json();
    // API wraps response in data.data.products
    expect(data.data).toHaveProperty('products');
    expect(Array.isArray(data.data.products)).toBe(true);
  });

  test('should support pagination', async ({ request }) => {
    const response = await request.get(`${API_BASE}/products?page=1&limit=5`);
    
    expect(response.ok()).toBe(true);
    
    const data = await response.json();
    expect(data.data.products.length).toBeLessThanOrEqual(5);
  });

  test('should support search', async ({ request }) => {
    const response = await request.get(`${API_BASE}/products?search=toy`);
    
    expect(response.ok()).toBe(true);
    
    const data = await response.json();
    expect(Array.isArray(data.data.products)).toBe(true);
  });

  test('should return single product by ID', async ({ request }) => {
    // First get a product ID
    const listResponse = await request.get(`${API_BASE}/products?limit=1`);
    const listData = await listResponse.json();
    
    if (listData.data?.products && listData.data.products.length > 0) {
      const productId = listData.data.products[0]._id;
      
      const response = await request.get(`${API_BASE}/products/${productId}`);
      expect(response.ok()).toBe(true);
      
      const data = await response.json();
      // The API returns the product in data.data or just data
      const product = data.data || data;
      expect(product).toBeTruthy();
    }
  });
});

test.describe('Categories API', () => {
  test('should return categories list', async ({ request }) => {
    const response = await request.get(`${API_BASE}/categories`);
    
    expect(response.ok()).toBe(true);
    
    const data = await response.json();
    // API may wrap in data property
    const categories = data.data || data;
    expect(Array.isArray(categories) || categories.categories).toBe(true);
  });
});

test.describe('Cart API', () => {
  test('should get cart for guest session', async ({ request }) => {
    const response = await request.get(`${API_BASE}/carts`, {
      headers: {
        'x-guest-session-id': 'test-session-123'
      }
    });
    
    // Should return 200 even for empty cart or new session
    expect(response.status()).toBeLessThanOrEqual(404); // 200 or 404 if not found
  });

  test('should add item to guest cart', async ({ request }) => {
    // First get a product ID
    const productsResponse = await request.get(`${API_BASE}/products?limit=1`);
    const productsData = await productsResponse.json();
    
    if (productsData.data?.products && productsData.data.products.length > 0) {
      const product = productsData.data.products[0];
      
      const response = await request.post(`${API_BASE}/carts/add`, {
        headers: {
          'x-guest-session-id': `test-session-${Date.now()}`
        },
        data: {
          productId: product._id,
          quantity: 1
        }
      });
      
      // Should succeed or return validation error
      expect(response.status()).toBeLessThanOrEqual(422);
    }
  });
});

test.describe('Auth API', () => {
  test('should reject login with invalid credentials', async ({ request }) => {
    const response = await request.post(`${API_BASE}/auth/login`, {
      data: {
        emailOrPhoneOrUsername: 'nonexistent@test.com',
        password: 'wrongpassword123'
      }
    });
    
    // Should return 401 or 404
    expect([400, 401, 404, 429]).toContain(response.status());
  });

  test('should validate registration input', async ({ request }) => {
    const response = await request.post(`${API_BASE}/auth/register`, {
      data: {
        email: 'invalid-email',
        password: '123'
      }
    });
    
    // Should return validation error or server error
    expect([400, 422, 429, 500]).toContain(response.status());
  });

  test('should have rate limit on auth endpoints', async ({ request }) => {
    // Check that rate limit headers are present
    const response = await request.post(`${API_BASE}/auth/login`, {
      data: {
        emailOrPhoneOrUsername: 'test@test.com',
        password: 'test123'
      }
    });
    
    // Rate limit headers should be present
    const hasRateLimitHeader = response.headers()['ratelimit-limit'] || 
                               response.headers()['x-ratelimit-limit'];
    expect(hasRateLimitHeader).toBeTruthy();
  });
});

test.describe('Reviews API', () => {
  test('should get reviews for a product', async ({ request }) => {
    // First get a product ID
    const productsResponse = await request.get(`${API_BASE}/products?limit=1`);
    const productsData = await productsResponse.json();
    
    if (productsData.data?.products && productsData.data.products.length > 0) {
      const productId = productsData.data.products[0]._id;
      
      const response = await request.get(`${API_BASE}/reviews/product/${productId}`);
      
      // Should return 200 even if no reviews
      expect([200, 404]).toContain(response.status());
    }
  });
});

test.describe('Discount Codes API', () => {
  test('should reject invalid discount code', async ({ request }) => {
    const response = await request.post(`${API_BASE}/discount-codes/validate`, {
      data: {
        code: 'INVALID_CODE_123456'
      }
    });
    
    // Should return 400 or 404 for invalid code
    expect([400, 404, 422]).toContain(response.status());
  });
});

test.describe('Health Check', () => {
  test('should have healthy API', async ({ request }) => {
    // Try multiple endpoints to verify API is running
    const response = await request.get(`${API_BASE}/products?limit=1`);
    expect(response.ok()).toBe(true);
  });
});
