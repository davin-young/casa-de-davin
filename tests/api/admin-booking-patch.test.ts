import { describe, it, expect, vi } from 'vitest';
import { PATCH } from '@/app/api/admin/bookings/[id]/route';
import { buildRequest, mockSession } from '../helpers';
import { mockSelectLimit } from '../setup';

const sampleBooking = {
  id: 'uuid-123',
  ref: 'CDD-10001',
  name: 'Kevin Ahn',
  room: 'bedroom',
  arrive: '2026-06-14',
  depart: '2026-06-17',
  status: 'pending',
  why: 'Olive oil.',
  travel: 'Flying',
  email: null,
  calendarEventId: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe('PATCH /api/admin/bookings/[id]', () => {
  it('returns 401 when not authenticated', async () => {
    mockSession(false);
    const req = buildRequest('/api/admin/bookings/uuid-123', {
      method: 'PATCH',
      body: { status: 'approved' },
    });
    const res = await PATCH(req, makeParams('uuid-123'));

    expect(res.status).toBe(401);
  });

  it('approves a pending booking', async () => {
    mockSession(true);
    mockSelectLimit.mockResolvedValueOnce([sampleBooking]);

    const req = buildRequest('/api/admin/bookings/uuid-123', {
      method: 'PATCH',
      body: { status: 'approved' },
    });
    const res = await PATCH(req, makeParams('uuid-123'));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
  });

  it('declines a pending booking', async () => {
    mockSession(true);
    mockSelectLimit.mockResolvedValueOnce([sampleBooking]);

    const req = buildRequest('/api/admin/bookings/uuid-123', {
      method: 'PATCH',
      body: { status: 'declined' },
    });
    const res = await PATCH(req, makeParams('uuid-123'));

    expect(res.status).toBe(200);
  });

  it('returns 400 for invalid status', async () => {
    mockSession(true);
    const req = buildRequest('/api/admin/bookings/uuid-123', {
      method: 'PATCH',
      body: { status: 'maybe' },
    });
    const res = await PATCH(req, makeParams('uuid-123'));

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('Status');
  });

  it('returns 404 when booking not found', async () => {
    mockSession(true);
    mockSelectLimit.mockResolvedValueOnce([]);

    const req = buildRequest('/api/admin/bookings/nonexistent', {
      method: 'PATCH',
      body: { status: 'approved' },
    });
    const res = await PATCH(req, makeParams('nonexistent'));

    expect(res.status).toBe(404);
  });

  it('returns 400 for missing body', async () => {
    mockSession(true);
    const req = new (await import('next/server')).NextRequest('http://localhost/api/admin/bookings/uuid-123', {
      method: 'PATCH',
      body: 'not json',
      headers: { 'content-type': 'application/json' },
    });
    const res = await PATCH(req, makeParams('uuid-123'));

    expect(res.status).toBe(400);
  });

  it('attempts calendar sync when calendarEventId exists', async () => {
    mockSession(true);
    const bookingWithCalendar = { ...sampleBooking, calendarEventId: 'cal-event-1' };
    mockSelectLimit.mockResolvedValueOnce([bookingWithCalendar]);

    const { updateEventStatus } = vi.mocked(await import('@/lib/google-calendar'));

    const req = buildRequest('/api/admin/bookings/uuid-123', {
      method: 'PATCH',
      body: { status: 'approved' },
    });
    await PATCH(req, makeParams('uuid-123'));

    expect(updateEventStatus).toHaveBeenCalledWith('cal-event-1', 'approved');
  });
});
