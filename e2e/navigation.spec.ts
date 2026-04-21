import { test, expect } from '@playwright/test';
import { unlockSiteGate } from './helpers';

test.describe('Navigation & Layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await unlockSiteGate(page);
  });

  test('nav bar renders after unlock', async ({ page }) => {
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('text=Rooms')).toBeVisible();
    await expect(page.locator('text=About')).toBeVisible();
    await expect(page.locator('text=Guestbook')).toBeVisible();
    await expect(page.locator('text=Admin')).toBeVisible();
  });

  test('admin link redirects appropriately', async ({ page }) => {
    await page.click('text=Admin');
    await page.waitForURL('**/login**');
    expect(page.url()).toContain('/login');
  });
});
