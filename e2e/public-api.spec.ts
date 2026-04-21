import { test, expect } from '@playwright/test';
import { testBooking } from './helpers';

test.describe('POST /api/book', () => {
  test('valid submission returns ok and ref', async ({ request }) => {
    const res = await request.post('/api/book', {
      data: testBooking(),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.ref).toMatch(/^CDD-\d{5}$/);
  });

  test('missing name returns 400', async ({ request }) => {
    const res = await request.post('/api/book', {
      data: { ...testBooking(), name: '' },
    });
    expect(res.status()).toBe(400);
  });

  test('invalid room returns 400', async ({ request }) => {
    const res = await request.post('/api/book', {
      data: { ...testBooking(), room: 'garage' },
    });
    expect(res.status()).toBe(400);
  });
});

test.describe('POST /api/invite/redeem', () => {
  test('invalid code returns 401', async ({ request }) => {
    const res = await request.post('/api/invite/redeem', {
      data: { code: 'INVALID' },
    });
    expect(res.status()).toBe(401);
  });
});

test.describe('GET /api/auth/status', () => {
  test('no session returns isGuest false, isAdmin false', async ({ request }) => {
    const res = await request.get('/api/auth/status');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.isGuest).toBe(false);
    expect(body.isAdmin).toBe(false);
  });
});
