import { NextResponse } from 'next/server';
import { eq, count } from 'drizzle-orm';
import { getSession } from '@/lib/session';
import { db } from '@/db';
import { bookings } from '@/db/schema';

export async function GET() {
  const session = await getSession();
  if (!session.isAdmin) {
    return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 });
  }

  const [total] = await db.select({ count: count() }).from(bookings);
  const [approved] = await db
    .select({ count: count() })
    .from(bookings)
    .where(eq(bookings.status, 'approved'));
  const [pending] = await db
    .select({ count: count() })
    .from(bookings)
    .where(eq(bookings.status, 'pending'));
  const [declined] = await db
    .select({ count: count() })
    .from(bookings)
    .where(eq(bookings.status, 'declined'));

  return NextResponse.json({
    ok: true,
    totalBookings: total.count,
    approvedStays: approved.count,
    pendingRequests: pending.count,
    declinedRequests: declined.count,
  });
}
