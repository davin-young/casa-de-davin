import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { bookings, blackoutDates } from '@/db/schema';

interface BlockedDate {
  start: string;
  end: string;
  room: 'couch' | 'bedroom' | null;
  type: 'booking' | 'blackout';
  label?: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const room = searchParams.get('room') as 'couch' | 'bedroom' | null;
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  try {
    // Fetch approved bookings
    const bookingRows = await db
      .select({
        arrive: bookings.arrive,
        depart: bookings.depart,
        room: bookings.room,
        name: bookings.name,
      })
      .from(bookings)
      .where(eq(bookings.status, 'approved'));

    // Fetch blackout dates
    const blackoutRows = await db
      .select()
      .from(blackoutDates);

    const blocked: BlockedDate[] = [];

    for (const b of bookingRows) {
      if (room && b.room !== room) continue;
      if (from && b.depart < from) continue;
      if (to && b.arrive > to) continue;
      blocked.push({
        start: b.arrive,
        end: b.depart,
        room: b.room,
        type: 'booking',
      });
    }

    for (const bl of blackoutRows) {
      if (room && bl.room && bl.room !== room) continue;
      if (from && bl.endDate < from) continue;
      if (to && bl.startDate > to) continue;
      blocked.push({
        start: bl.startDate,
        end: bl.endDate,
        room: bl.room,
        type: 'blackout',
        label: bl.label,
      });
    }

    return NextResponse.json({ ok: true, blocked });
  } catch (err) {
    console.error('Failed to fetch blocked dates:', err instanceof Error ? err.message : err);
    return NextResponse.json({ ok: false, error: 'Failed to fetch blocked dates.' }, { status: 500 });
  }
}
