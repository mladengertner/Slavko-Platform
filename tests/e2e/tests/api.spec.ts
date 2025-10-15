import { test, expect } from '@playwright/test';

test.describe('API Endpoint Tests', () => {
  const baseURL = 'http://localhost:5173'; // Or your functions emulator URL

  test('GET /api/leaderboard should return public data', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/leaderboard`);
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    if (data.length > 0) {
      expect(data[0]).toHaveProperty('email');
      expect(data[0]).toHaveProperty('builds');
    }
  });

  test('POST /api/ideas/generate should be protected', async ({ request }) => {
    const response = await request.post(`${baseURL}/api/ideas/generate`, {
      data: { userId: 'test-user' },
    });
    // Without a valid JWT, this should fail.
    // The functions emulator might return 403, a real service would return 401/403.
    expect(response.status()).toBe(401); 
  });

  test('POST /api/builds/start should be protected', async ({ request }) => {
    const response = await request.post(`${baseURL}/api/builds/start`, {
      data: { userId: 'test-user', ideaId: 'test-idea' },
    });
    expect(response.status()).toBe(401);
  });
  
  test('POST /api/rewards/social-share should be protected', async ({ request }) => {
    const response = await request.post(`${baseURL}/api/rewards/social-share`, {
      data: {},
    });
    expect(response.status()).toBe(401);
  });
});