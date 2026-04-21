import { type Page } from '@playwright/test';

/**
 * Unlock the site gate by entering the site password or dev bypass.
 */
export async function unlockSiteGate(page: Page) {
  // In dev, use the DEV bypass code
  const input = page.locator('input[placeholder*="invite"]').first();
  if (await input.isVisible({ timeout: 3000 }).catch(() => false)) {
    await input.fill('DEV');
    await page.locator('button:has-text("Enter")').first().click();
    await page.waitForTimeout(500);
  }
}

/**
 * Set admin session cookie for authenticated admin tests.
 * This bypasses Google OAuth by directly setting the session cookie.
 */
export async function setAdminSession(page: Page) {
  // We'll use the API to create a session — requires a test-only endpoint or cookie injection
  // For now, this is a placeholder that tests should implement based on their setup
}

/**
 * Generate a unique booking for testing.
 */
export function testBooking(overrides: Record<string, string> = {}) {
  return {
    name: `Test Guest ${Date.now()}`,
    room: 'couch' as const,
    arrive: '2026-08-01',
    depart: '2026-08-03',
    why: 'E2E test booking',
    travel: 'Testing',
    activities: 'Testing',
    ...overrides,
  };
}
