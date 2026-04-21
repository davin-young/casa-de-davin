import { test, expect } from '@playwright/test';

test.describe('Admin API routes (unauthenticated)', () => {
  test('GET /api/admin/bookings returns 401 without session', async ({ request }) => {
    const res = await request.get('/api/admin/bookings');
    expect(res.status()).toBe(401);
  });

  test('PATCH /api/admin/bookings/[id] returns 401 without session', async ({ request }) => {
    const res = await request.patch('/api/admin/bookings/fake-id', {
      data: { status: 'approved' },
    });
    expect(res.status()).toBe(401);
  });

  test('GET /api/admin/invites returns 401 without session', async ({ request }) => {
    const res = await request.get('/api/admin/invites');
    expect(res.status()).toBe(401);
  });
});
