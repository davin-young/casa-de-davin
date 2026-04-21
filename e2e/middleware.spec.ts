import { test, expect } from '@playwright/test';

test.describe('Auth Middleware', () => {
  test('/admin redirects to /login without session', async ({ page }) => {
    const response = await page.goto('/admin');
    expect(page.url()).toContain('/login');
  });

  test('/api/admin/bookings returns 401 JSON without session', async ({ request }) => {
    const res = await request.get('/api/admin/bookings');
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.ok).toBe(false);
  });

  test('/api/admin/auth returns 403 (intentionally disabled)', async ({ request }) => {
    const res = await request.post('/api/admin/auth', {
      data: { password: 'test' },
    });
    expect(res.status()).toBe(403);
  });
});
