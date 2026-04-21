import { test, expect } from '@playwright/test';

test.describe('Site Gate', () => {
  test('shows gate when not authenticated', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('input[placeholder*="invite"], input[placeholder*="code"]').first()).toBeVisible();
  });

  test('rejects invalid code', async ({ page }) => {
    await page.goto('/');
    const input = page.locator('input[placeholder*="invite"], input[placeholder*="code"]').first();
    await input.fill('BADCODE');
    await page.locator('button:has-text("Enter"), button:has-text("Unlock"), button[type="submit"]').first().click();
    await expect(page.locator('text=/invalid|wrong|incorrect/i')).toBeVisible();
  });

  test('DEV bypass works in development', async ({ page }) => {
    await page.goto('/');
    const input = page.locator('input[placeholder*="invite"], input[placeholder*="code"]').first();
    if (await input.isVisible({ timeout: 3000 }).catch(() => false)) {
      await input.fill('DEV');
      await page.locator('button:has-text("Enter"), button:has-text("Unlock"), button[type="submit"]').first().click();
      await page.waitForTimeout(1000);
      // After unlocking, should see the main site content
      await expect(page.locator('text=/rooms|couch|bedroom/i').first()).toBeVisible({ timeout: 5000 });
    }
  });
});
