import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { bookings } from '@/db/schema';
import { checkRateLimit } from '@/lib/rate-limit';
import { updateEventStatus } from '@/lib/google-calendar';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ ref: string }> },
) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';

  const rateResult = checkRateLimit(`cancel:${ip}`);
  if (!rateResult.allowed) {
    return NextResponse.json(
      { ok: false, error: 'Too many requests. Slow down.' },
      { status: 429 },
    );
  }

  const { ref } = await params;
  if (!ref) {
    return NextResponse.json({ ok: false, error: 'Ref code required.' }, { status: 400 });
  }

  try {
    const [booking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.ref, ref))
      .limit(1);

    if (!booking) {
      return NextResponse.json({ ok: false, error: 'Booking not found.' }, { status: 404 });
    }

    if (booking.status === 'declined') {
      return NextResponse.json({ ok: false, error: 'Booking is already cancelled.' }, { status: 400 });
    }

    await db
      .update(bookings)
      .set({ status: 'declined', updatedAt: new Date() })
      .where(eq(bookings.id, booking.id));

    // Update Google Calendar event status if exists
    if (booking.calendarEventId) {
      try {
        await updateEventStatus(booking.calendarEventId, 'declined');
      } catch (calErr) {
        console.error('Calendar update failed (non-fatal):', calErr instanceof Error ? calErr.message : calErr);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Booking cancellation failed:', err instanceof Error ? err.message : err);
    return NextResponse.json(
      { ok: false, error: 'Something went wrong.' },
      { status: 500 },
    );
  }
}
