import { NextResponse } from 'next/server';
import { desc } from 'drizzle-orm';
import { getSession } from '@/lib/session';
import { db } from '@/db';
import { bookings } from '@/db/schema';
import type { Booking } from '@/types/booking';

interface BookingsResponse {
  ok: true;
  bookings: Booking[];
}

interface ErrorResponse {
  ok: false;
  error: string;
}

export async function GET(): Promise<NextResponse<BookingsResponse | ErrorResponse>> {
  const session = await getSession();
  if (!session.isAdmin) {
    return NextResponse.json({ ok: false as const, error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const rows = await db
      .select()
      .from(bookings)
      .orderBy(desc(bookings.createdAt));

    return NextResponse.json({ ok: true as const, bookings: rows });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Failed to list bookings:', message);
    return NextResponse.json(
      { ok: false as const, error: 'Failed to fetch bookings.' },
      { status: 500 },
    );
  }
}
