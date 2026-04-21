import { test, expect } from '@playwright/test';

test.describe('Health & Error Pages', () => {
  test('GET /api/health returns ok when DB is up', async ({ request }) => {
    const res = await request.get('/api/health');
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.db).toBe('connected');
  });

  test('navigating to nonexistent page shows custom 404', async ({ page }) => {
    await page.goto('/nonexistent-page-xyz');
    await expect(page.locator('text=wandered off')).toBeVisible();
  });

  test('404 page has link back to home', async ({ page }) => {
    await page.goto('/nonexistent-page-xyz');
    const homeLink = page.locator('a[href="/"]');
    await expect(homeLink).toBeVisible();
  });
});
