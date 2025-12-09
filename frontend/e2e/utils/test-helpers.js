/**
 * Test Utilities and Helpers
 * Shared functions for E2E tests
 */

export const API_BASE = 'http://localhost:5000/api';
export const APP_BASE = 'http://localhost:5173';

/**
 * Generate a unique email for testing
 */
export function generateTestEmail() {
  return `test-${Date.now()}-${Math.random().toString(36).slice(2)}@test.com`;
}

/**
 * Generate a unique username for testing
 */
export function generateTestUsername() {
  return `testuser_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

/**
 * Generate a unique guest session ID
 */
export function generateGuestSessionId() {
  return `guest-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Wait for API to be ready
 */
export async function waitForApi(request, maxAttempts = 10) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await request.get(`${API_BASE}/products?limit=1`);
      if (response.ok()) {
        return true;
      }
    } catch {
      // API not ready yet
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  return false;
}

/**
 * Get a product ID from the API
 */
export async function getProductId(request) {
  const response = await request.get(`${API_BASE}/products?limit=1`);
  const data = await response.json();
  return data.data?.products?.[0]?._id || null;
}

/**
 * Clear localStorage in page
 */
export async function clearStorage(page) {
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

/**
 * Login helper - performs login via UI
 */
export async function loginUser(page, email, password) {
  await page.goto('/login');
  await page.fill('input[type="email"], input[name="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForLoadState('networkidle');
}

/**
 * Check if element exists
 */
export async function elementExists(page, selector) {
  return await page.locator(selector).count() > 0;
}

/**
 * Wait for toast notification
 */
export async function waitForToast(page, text) {
  await page.locator(`text=${text}`).waitFor({ timeout: 5000 });
}

/**
 * Format price for comparison
 */
export function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN').format(price);
}
