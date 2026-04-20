import { describe, it, expect } from 'vitest';
import { POST } from '@/app/api/admin/auth/route';
import { buildRequest } from '../helpers';
import { mockSessionData } from '../setup';

describe('POST /api/admin/auth', () => {
  it('returns 200 and sets session for correct password', async () => {
    const req = buildRequest('/api/admin/auth', {
      method: 'POST',
      body: { password: 'sincerely' },
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(mockSessionData.isAdmin).toBe(true);
    expect(mockSessionData.save).toHaveBeenCalled();
  });

  it('returns 401 for wrong password', async () => {
    const req = buildRequest('/api/admin/auth', {
      method: 'POST',
      body: { password: 'wrongpassword' },
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.ok).toBe(false);
    expect(data.error).toBeTruthy();
  });

  it('returns 401 for missing password', async () => {
    const req = buildRequest('/api/admin/auth', {
      method: 'POST',
      body: { password: '' },
    });
    const res = await POST(req);

    expect(res.status).toBe(401);
  });

  it('accepts password case-insensitively', async () => {
    const req = buildRequest('/api/admin/auth', {
      method: 'POST',
      body: { password: 'SINCERELY' },
    });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
  });

  it('returns 400 for invalid body', async () => {
    const req = new (await import('next/server')).NextRequest('http://localhost/api/admin/auth', {
      method: 'POST',
      body: 'not json',
      headers: { 'content-type': 'application/json' },
    });
    const res = await POST(req);

    expect(res.status).toBe(400);
  });
});
