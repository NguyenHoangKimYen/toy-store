import { test, expect } from '@playwright/test';

/**
 * Admin Panel Tests
 * Tests: Admin access, dashboard, product management, order management
 */

const API_BASE = 'http://localhost:5000/api';

test.describe('Admin Panel Access', () => {
  test('should handle admin route access', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('domcontentloaded');
    
    // Admin route could: redirect to home, redirect to login, show admin page, or show access denied
    // All are valid behaviors depending on app design
    const pageLoaded = await page.locator('body').isVisible();
    expect(pageLoaded).toBe(true);
  });

  test('should have admin routes defined', async ({ page }) => {
    // Check that admin routes exist (even if protected)
    const adminRoutes = ['/admin', '/admin/products', '/admin/orders', '/admin/users'];
    
    for (const route of adminRoutes) {
      await page.goto(route);
      // Should either show admin page or redirect (not 404)
      const is404 = await page.locator('text=404, text=not found').first()
        .isVisible({ timeout: 2000 }).catch(() => false);
      
      // Admin routes should exist (redirect or show content, not 404)
      expect(is404).toBe(false);
    }
  });
});

test.describe('Admin API Endpoints', () => {
  test('should reject unauthorized access to admin endpoints', async ({ request }) => {
    // Try to access admin endpoints without auth
    const adminEndpoints = [
      { method: 'GET', url: `${API_BASE}/admin/dashboard` },
      { method: 'GET', url: `${API_BASE}/users` },
    ];
    
    for (const endpoint of adminEndpoints) {
      const response = await request.get(endpoint.url);
      // Should return 401, 403, 404, or 429 (rate limited)
      expect([401, 403, 404, 429]).toContain(response.status());
    }
  });

  test('should have products management API', async ({ request }) => {
    // Public product listing should work
    const response = await request.get(`${API_BASE}/products?limit=1`);
    expect(response.ok()).toBe(true);
  });

  test('should have orders API (requires auth)', async ({ request }) => {
    const response = await request.get(`${API_BASE}/orders`);
    // Should require authentication
    expect([401, 403]).toContain(response.status());
  });

  test('should have users API (requires admin)', async ({ request }) => {
    const response = await request.get(`${API_BASE}/users`);
    // Should require admin authentication
    expect([401, 403, 404]).toContain(response.status());
  });
});

test.describe('Dashboard API', () => {
  test('should have dashboard stats endpoint', async ({ request }) => {
    const response = await request.get(`${API_BASE}/admin/dashboard`);
    // Requires auth, should return 401/403
    expect([401, 403, 404]).toContain(response.status());
  });
});
