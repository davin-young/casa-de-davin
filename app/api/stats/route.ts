import { NextResponse } from 'next/server';
import { eq, count, sql, and, gte } from 'drizzle-orm';
import { getSession } from '@/lib/session';
import { db } from '@/db';
import { bookings, inviteCodes } from '@/db/schema';

export async function GET() {
  const session = await getSession();
  if (!session.isAdmin) {
    return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 });
  }

  const [total] = await db.select({ count: count() }).from(bookings);
  const [approved] = await db.select({ count: count() }).from(bookings).where(eq(bookings.status, 'approved'));
  const [pending] = await db.select({ count: count() }).from(bookings).where(eq(bookings.status, 'pending'));
  const [declined] = await db.select({ count: count() }).from(bookings).where(eq(bookings.status, 'declined'));

  // Bookings this month
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const [thisMonth] = await db.select({ count: count() }).from(bookings)
    .where(gte(bookings.createdAt, monthStart));

  // Room split
  const [couch] = await db.select({ count: count() }).from(bookings).where(eq(bookings.room, 'couch'));
  const [bedroom] = await db.select({ count: count() }).from(bookings).where(eq(bookings.room, 'bedroom'));

  // Average stay length (approved bookings)
  const approvedBookings = await db.select({ arrive: bookings.arrive, depart: bookings.depart })
    .from(bookings).where(eq(bookings.status, 'approved'));
  const avgStay = approvedBookings.length > 0
    ? approvedBookings.reduce((sum, b) => sum + Math.round((new Date(b.depart).getTime() - new Date(b.arrive).getTime()) / 86_400_000), 0) / approvedBookings.length
    : 0;

  // Invite redemption rate
  const [totalInvites] = await db.select({ count: count() }).from(inviteCodes);
  const [redeemedInvites] = await db.select({ count: count() }).from(inviteCodes)
    .where(sql`${inviteCodes.redeemedAt} IS NOT NULL`);

  return NextResponse.json({
    ok: true,
    totalBookings: total.count,
    approvedStays: approved.count,
    pendingRequests: pending.count,
    declinedRequests: declined.count,
    bookingsThisMonth: thisMonth.count,
    roomSplit: { couch: couch.count, bedroom: bedroom.count },
    averageStayNights: Math.round(avgStay * 10) / 10,
    inviteRedemptionRate: totalInvites.count > 0
      ? Math.round((redeemedInvites.count / totalInvites.count) * 100)
      : 0,
  });
}
