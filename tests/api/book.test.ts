import { describe, it, expect, vi } from 'vitest';
import { POST } from '@/app/api/book/route';
import { buildRequest, validBookingBody } from '../helpers';
import { _resetForTest } from '@/lib/rate-limit';

describe('POST /api/book', () => {
  it('creates a booking with valid data', async () => {
    const req = buildRequest('/api/book', { method: 'POST', body: validBookingBody() });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.ref).toMatch(/^CDD-\d{5}$/);
    expect(data.id).toBe('mock-uuid-1234');
  });

  it('returns 400 when name is missing', async () => {
    const body = { ...validBookingBody(), name: '' };
    const req = buildRequest('/api/book', { method: 'POST', body });
    const res = await POST(req);

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.ok).toBe(false);
    expect(data.error).toContain('Name');
  });

  it('returns 400 when room is invalid', async () => {
    const body = { ...validBookingBody(), room: 'garage' };
    const req = buildRequest('/api/book', { method: 'POST', body });
    const res = await POST(req);

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('Room');
  });

  it('returns 400 when arrive date is missing', async () => {
    const body = { ...validBookingBody(), arrive: '' };
    const req = buildRequest('/api/book', { method: 'POST', body });
    const res = await POST(req);

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('arrival');
  });

  it('returns 400 when depart date is missing', async () => {
    const body = { ...validBookingBody(), depart: '' };
    const req = buildRequest('/api/book', { method: 'POST', body });
    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  it('returns 400 when why is missing', async () => {
    const body = { ...validBookingBody(), why: '' };
    const req = buildRequest('/api/book', { method: 'POST', body });
    const res = await POST(req);

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('why');
  });

  it('rate limits repeated requests from same IP', async () => {
    const req1 = buildRequest('/api/book', {
      method: 'POST',
      body: validBookingBody(),
      headers: { 'x-forwarded-for': '1.2.3.4' },
    });
    const res1 = await POST(req1);
    expect(res1.status).toBe(200);

    const req2 = buildRequest('/api/book', {
      method: 'POST',
      body: validBookingBody(),
      headers: { 'x-forwarded-for': '1.2.3.4' },
    });
    const res2 = await POST(req2);
    expect(res2.status).toBe(429);

    const data = await res2.json();
    expect(data.error).toContain('tiger');
    expect(data.retryAfter).toBeGreaterThan(0);
  });

  it('returns 400 for malformed JSON', async () => {
    const req = new (await import('next/server')).NextRequest('http://localhost/api/book', {
      method: 'POST',
      body: 'not json{{{',
      headers: { 'content-type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('calls sendBookingNotification with correct data', async () => {
    const { sendBookingNotification } = vi.mocked(await import('@/lib/email'));
    const body = validBookingBody();
    const req = buildRequest('/api/book', { method: 'POST', body });
    await POST(req);

    expect(sendBookingNotification).toHaveBeenCalledTimes(1);
    expect(sendBookingNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test User',
        room: 'couch',
        arrive: '2026-07-01',
        depart: '2026-07-04',
      }),
    );
  });

  it('succeeds even when calendar sync fails', async () => {
    const { createBookingEvent } = vi.mocked(await import('@/lib/google-calendar'));
    createBookingEvent.mockRejectedValueOnce(new Error('Calendar down'));

    const req = buildRequest('/api/book', { method: 'POST', body: validBookingBody() });
    const res = await POST(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
  });
});
