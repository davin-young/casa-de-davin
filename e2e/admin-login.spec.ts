import { test, expect } from '@playwright/test';

test.describe('Admin Login', () => {
  test('unauthenticated redirects to /login', async ({ page }) => {
    await page.goto('/admin');
    expect(page.url()).toContain('/login');
  });

  test('login page shows Sign in with Google button', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('text=/sign in with google|google/i').first()).toBeVisible();
  });

  test('auth error messages display correctly', async ({ page }) => {
    await page.goto('/login?auth_error=not_authorized');
    await expect(page.locator('text=/not authorized|unauthorized/i').first()).toBeVisible();
  });
});
