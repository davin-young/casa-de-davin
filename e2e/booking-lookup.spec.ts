import { test, expect } from '@playwright/test';
import { testBooking } from './helpers';

test.describe('Guest Booking Lookup', () => {
  let ref: string;

  test.beforeAll(async ({ request }) => {
    // Create a test booking
    const res = await request.post('/api/book', { data: testBooking() });
    const body = await res.json();
    ref = body.ref;
  });

  test('valid ref shows booking status page', async ({ page }) => {
    await page.goto(`/booking/${ref}`);
    await expect(page.locator('text=Hang tight')).toBeVisible();
  });

  test('invalid ref shows not found', async ({ page }) => {
    await page.goto('/booking/CDD-00000');
    await expect(page.locator('text=not found')).toBeVisible();
  });

  test('does not expose private fields', async ({ request }) => {
    const res = await request.get(`/api/booking/${ref}`);
    const body = await res.json();
    expect(body.booking).not.toHaveProperty('why');
    expect(body.booking).not.toHaveProperty('travel');
    expect(body.booking).not.toHaveProperty('email');
  });
});
