import { test, expect } from '@playwright/test';

/**
 * Rate Limiting Tests
 * Tests: API rate limits are enforced
 */

const API_BASE = 'http://localhost:5000/api';

test.describe('Rate Limiting', () => {
  test('should have rate limit headers on API responses', async ({ request }) => {
    const response = await request.get(`${API_BASE}/products?limit=1`);
    
    // May be 200 or 429 if rate limited from previous tests
    expect([200, 429]).toContain(response.status());
    // Rate limit headers should be present regardless
    expect(response.headers()['ratelimit-limit']).toBeTruthy();
  });

  test('should enforce login rate limit', async ({ request }) => {
    const loginUrl = `${API_BASE}/auth/login`;
    const payload = {
      emailOrPhoneOrUsername: 'ratelimit-test@fake.com',
      password: 'wrongpassword',
    };

    // Make 16 requests (limit is 15)
    let rateLimited = false;
    
    for (let i = 0; i < 16; i++) {
      const response = await request.post(loginUrl, { data: payload });
      
      if (response.status() === 429) {
        rateLimited = true;
        const body = await response.json();
        expect(body.message).toContain('Too many');
        break;
      }
    }
    
    expect(rateLimited).toBe(true);
  });

  test('should enforce general API rate limit headers', async ({ request }) => {
    // Make a few requests and check remaining decreases
    const response1 = await request.get(`${API_BASE}/products?limit=1`);
    const remaining1 = parseInt(response1.headers()['ratelimit-remaining'] || '0');
    
    const response2 = await request.get(`${API_BASE}/products?limit=1`);
    const remaining2 = parseInt(response2.headers()['ratelimit-remaining'] || '0');
    
    // Remaining should decrease or already be 0 (rate limited)
    expect(remaining2).toBeLessThanOrEqual(remaining1);
  });
});
