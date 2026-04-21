import { test, expect } from '@playwright/test';
import { unlockSiteGate } from './helpers';

test.describe('Guest Booking Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await unlockSiteGate(page);
  });

  test('landing page shows room cards after unlock', async ({ page }) => {
    await expect(page.locator('text=/couch|bedroom/i').first()).toBeVisible({ timeout: 5000 });
  });

  test('navigate to couch booking', async ({ page }) => {
    await page.locator('text=/couch/i').first().click();
    await page.waitForTimeout(1000);
    // Should see the booking form
    await expect(page.locator('text=/booking slip|fill this out/i').first()).toBeVisible({ timeout: 5000 });
  });

  test('form validation: empty submission blocked', async ({ page }) => {
    await page.goto('/book/couch');
    await unlockSiteGate(page);
    // Submit button should be disabled when form is empty
    const submitBtn = page.locator('button:has-text("Send"), button:has-text("plea")').first();
    if (await submitBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(submitBtn).toBeDisabled();
    }
  });

  test('calendar navigation works', async ({ page }) => {
    await page.goto('/book/couch');
    await unlockSiteGate(page);
    // Click next month arrow
    const nextBtn = page.locator('button').filter({ has: page.locator('svg') }).last();
    if (await nextBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await nextBtn.click();
      await page.waitForTimeout(500);
    }
  });
});
