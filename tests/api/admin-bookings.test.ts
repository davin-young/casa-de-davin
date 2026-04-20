import { describe, it, expect } from 'vitest';
import { GET } from '@/app/api/admin/bookings/route';
import { mockSession } from '../helpers';
import { mockSelectFrom } from '../setup';

const sampleBooking = {
  id: 'uuid-1',
  ref: 'CDD-10001',
  name: 'Kevin Ahn',
  room: 'bedroom',
  arrive: '2026-06-14',
  depart: '2026-06-17',
  status: 'pending',
  why: 'Bringing olive oil.',
  travel: 'Flying',
  email: null,
  calendarEventId: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('GET /api/admin/bookings', () => {
  it('returns 401 when not authenticated', async () => {
    mockSession(false);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it('returns empty bookings when none exist', async () => {
    mockSession(true);
    mockSelectFrom.mockReturnValueOnce({
      where: () => ({ limit: () => Promise.resolve([]) }),
      orderBy: () => Promise.resolve([]),
    });

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.bookings).toEqual([]);
  });

  it('returns bookings when they exist', async () => {
    mockSession(true);
    mockSelectFrom.mockReturnValueOnce({
      where: () => ({ limit: () => Promise.resolve([sampleBooking]) }),
      orderBy: () => Promise.resolve([sampleBooking]),
    });

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.bookings).toHaveLength(1);
    expect(data.bookings[0].name).toBe('Kevin Ahn');
  });
});
