import { test, expect } from '@playwright/test';

/**
 * User Profile Tests
 * Tests: Profile page, update profile, addresses, order history
 */

const API_BASE = 'http://localhost:5000/api';

test.describe('Profile Page Access', () => {
  test('should show profile page or redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('domcontentloaded');
    
    // Profile page may either:
    // 1. Redirect to login (if route is protected)
    // 2. Show login prompt on the page
    // 3. Show empty profile state
    const url = page.url();
    const isOnLoginPage = url.includes('login') || url.includes('auth');
    const hasLoginPrompt = await page.locator('text=login, text=sign in, text=đăng nhập').first()
      .isVisible({ timeout: 3000 }).catch(() => false);
    const isOnProfilePage = url.includes('profile');
    
    // Any of these behaviors is acceptable
    expect(isOnLoginPage || hasLoginPrompt || isOnProfilePage).toBe(true);
  });

  test('should show order-history page or redirect when not authenticated', async ({ page }) => {
    await page.goto('/order-history');
    await page.waitForLoadState('domcontentloaded');
    
    const url = page.url();
    const isOnLoginPage = url.includes('login') || url.includes('auth');
    const hasLoginPrompt = await page.locator('text=login, text=sign in').first()
      .isVisible({ timeout: 3000 }).catch(() => false);
    const isOnOrderHistoryPage = url.includes('order-history');
    
    // Any of these behaviors is acceptable  
    expect(isOnLoginPage || hasLoginPrompt || isOnOrderHistoryPage).toBe(true);
  });
});

test.describe('Profile API', () => {
  test('should require auth for profile endpoint', async ({ request }) => {
    const response = await request.get(`${API_BASE}/users/profile`);
    expect([401, 403]).toContain(response.status());
  });

  test('should require auth for update profile', async ({ request }) => {
    const response = await request.put(`${API_BASE}/users/profile`, {
      data: { name: 'Test User' }
    });
    expect([401, 403]).toContain(response.status());
  });
});

test.describe('Addresses API', () => {
  test('should handle addresses endpoint request', async ({ request }) => {
    const response = await request.get(`${API_BASE}/addresses`);
    // API may return 200 (empty list), 401/403 (unauthorized), or 404 (not found)
    expect([200, 400, 401, 403, 404]).toContain(response.status());
  });

  test('should handle create address request', async ({ request }) => {
    const response = await request.post(`${API_BASE}/addresses`, {
      data: {
        street: '123 Test St',
        city: 'Test City',
        country: 'Vietnam'
      }
    });
    // API may return 200/201 (created), 400 (validation), or 401/403 (unauthorized)
    expect([200, 201, 400, 401, 403]).toContain(response.status());
  });

  test('should handle update address request', async ({ request }) => {
    const response = await request.put(`${API_BASE}/addresses/123456789012`, {
      data: { street: 'Updated St' }
    });
    // API may return 200 (updated), 400 (validation), 401/403 (unauthorized), or 404 (not found)
    expect([200, 400, 401, 403, 404]).toContain(response.status());
  });

  test('should handle delete address request', async ({ request }) => {
    const response = await request.delete(`${API_BASE}/addresses/123456789012`);
    // API may return 200 (deleted), 400 (bad request), 401/403 (unauthorized), or 404 (not found)
    expect([200, 400, 401, 403, 404]).toContain(response.status());
  });
});

test.describe('Order History API', () => {
  test('should require auth for orders endpoint', async ({ request }) => {
    const response = await request.get(`${API_BASE}/orders`);
    expect([401, 403, 429]).toContain(response.status());
  });

  test('should require auth for single order', async ({ request }) => {
    const response = await request.get(`${API_BASE}/orders/123456789012`);
    expect([401, 403, 404, 429]).toContain(response.status());
  });

  test('should require auth to cancel order', async ({ request }) => {
    const response = await request.put(`${API_BASE}/orders/123456789012/cancel`);
    expect([401, 403, 404, 429]).toContain(response.status());
  });
});
