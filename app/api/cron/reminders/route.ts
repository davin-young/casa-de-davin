import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings } from '@/db/schema';
import { eq, and, lt, gte, isNotNull } from 'drizzle-orm';
import {
  sendGuestPreArrival,
  sendHostPreArrival,
  sendGuestPostStay,
  sendHostPostStay,
  sendHostNudge,
  type BookingEmailData,
} from '@/lib/email';

function toEmailData(b: typeof bookings.$inferSelect): BookingEmailData {
  return {
    name: b.name,
    room: b.room,
    arrive: b.arrive,
    depart: b.depart,
    why: b.why,
    travel: b.travel,
    activities: b.activities,
    ref: b.ref,
    email: b.email ?? undefined,
  };
}

function isoDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const tomorrow = isoDate(new Date(now.getTime() + 86_400_000));
  const yesterday = isoDate(new Date(now.getTime() - 86_400_000));
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

  const sent: string[] = [];

  try {
    // 1. Pre-arrival reminders (approved bookings arriving tomorrow)
    const arrivingTomorrow = await db
      .select()
      .from(bookings)
      .where(and(
        eq(bookings.status, 'approved'),
        eq(bookings.arrive, tomorrow),
      ));

    for (const b of arrivingTomorrow) {
      const data = toEmailData(b);
      if (b.email) {
        await sendGuestPreArrival(data, b.email).catch(console.error);
        sent.push(`guest-pre-arrival:${b.ref}`);
      }
      await sendHostPreArrival(data).catch(console.error);
      sent.push(`host-pre-arrival:${b.ref}`);
    }

    // 2. Post-stay emails (approved bookings that departed yesterday)
    const departedYesterday = await db
      .select()
      .from(bookings)
      .where(and(
        eq(bookings.status, 'approved'),
        eq(bookings.depart, yesterday),
      ));

    for (const b of departedYesterday) {
      const data = toEmailData(b);
      if (b.email) {
        await sendGuestPostStay(data, b.email).catch(console.error);
        sent.push(`guest-post-stay:${b.ref}`);
      }
      await sendHostPostStay(data).catch(console.error);
      sent.push(`host-post-stay:${b.ref}`);
    }

    // 3. Host nudge (pending bookings >24h but <48h old, with email)
    const staleBookings = await db
      .select()
      .from(bookings)
      .where(and(
        eq(bookings.status, 'pending'),
        lt(bookings.createdAt, twentyFourHoursAgo),
        gte(bookings.createdAt, fortyEightHoursAgo),
        isNotNull(bookings.email),
      ));

    for (const b of staleBookings) {
      const data = toEmailData(b);
      await sendHostNudge(data).catch(console.error);
      sent.push(`host-nudge:${b.ref}`);
    }

    return NextResponse.json({ ok: true, sent, count: sent.length });
  } catch (err) {
    console.error('Cron reminders failed:', err);
    return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500 });
  }
}
