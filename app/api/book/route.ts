import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings, blackoutDates } from '@/db/schema';
import { createBookingEvent } from '@/lib/google-calendar';
import { sendBookingNotification } from '@/lib/email';
import { checkRateLimit } from '@/lib/rate-limit';
import { eq, and, lt, gt, or, isNull } from 'drizzle-orm';

interface BookingRequest {
  name: string;
  room: 'couch' | 'bedroom';
  arrive: string;
  depart: string;
  why: string;
  travel: string;
  activities: string;
  email?: string;
}

interface BookingResponse {
  ok: true;
  ref: string;
  id: string;
}

interface ErrorResponse {
  ok: false;
  error: string;
  retryAfter?: number;
}

function generateRef(): string {
  return 'CDD-' + Math.floor(Math.random() * 90000 + 10000).toString();
}

function isValidRoom(room: string): room is 'couch' | 'bedroom' {
  return room === 'couch' || room === 'bedroom';
}

function isValidDate(dateStr: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr) && !isNaN(new Date(dateStr).getTime());
}

export async function POST(request: NextRequest): Promise<NextResponse<BookingResponse | ErrorResponse>> {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';

  const rateResult = checkRateLimit(ip);
  if (!rateResult.allowed) {
    return NextResponse.json(
      { ok: false as const, error: 'Easy tiger. One submission per minute.', retryAfter: rateResult.retryAfter },
      { status: 429 },
    );
  }

  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ ok: false as const, error: 'Invalid request body.' }, { status: 400 });
  }

  const { name, room, arrive, depart, why, travel, activities, email } = body as BookingRequest;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return NextResponse.json({ ok: false as const, error: 'Name is required.' }, { status: 400 });
  }
  if (!room || !isValidRoom(room)) {
    return NextResponse.json({ ok: false as const, error: 'Room must be "couch" or "bedroom".' }, { status: 400 });
  }
  if (!arrive || !isValidDate(arrive)) {
    return NextResponse.json({ ok: false as const, error: 'Valid arrival date is required.' }, { status: 400 });
  }
  if (!depart || !isValidDate(depart)) {
    return NextResponse.json({ ok: false as const, error: 'Valid departure date is required.' }, { status: 400 });
  }
  if (!why || typeof why !== 'string' || why.trim().length === 0) {
    return NextResponse.json({ ok: false as const, error: 'Tell me why you want to stay.' }, { status: 400 });
  }

  const ref = generateRef();

  try {
    // Validate email if provided
    const trimmedEmail = email?.trim() || null;
    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return NextResponse.json({ ok: false as const, error: 'Invalid email address.' }, { status: 400 });
    }

    // Check for overlap with approved bookings (same room)
    const overlappingBookings = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(and(
        eq(bookings.room, room),
        eq(bookings.status, 'approved'),
        lt(bookings.arrive, depart),
        gt(bookings.depart, arrive),
      ))
      .limit(1);

    if (overlappingBookings.length > 0) {
      return NextResponse.json(
        { ok: false as const, error: 'Those dates are already taken for this room.' },
        { status: 409 },
      );
    }

    // Check for overlap with blackout dates (same room or both rooms)
    const overlappingBlackouts = await db
      .select({ id: blackoutDates.id })
      .from(blackoutDates)
      .where(and(
        or(eq(blackoutDates.room, room), isNull(blackoutDates.room)),
        lt(blackoutDates.startDate, depart),
        gt(blackoutDates.endDate, arrive),
      ))
      .limit(1);

    if (overlappingBlackouts.length > 0) {
      return NextResponse.json(
        { ok: false as const, error: 'Those dates are unavailable.' },
        { status: 409 },
      );
    }

    // Insert into database
    const [inserted] = await db.insert(bookings).values({
      ref,
      name: name.trim(),
      room,
      arrive,
      depart,
      why: why.trim(),
      travel: (travel || '').trim(),
      activities: (activities || '').trim(),
      email: trimmedEmail,
    }).returning({ id: bookings.id });

    // Optional: sync to Google Calendar
    try {
      const calResult = await createBookingEvent({
        name: name.trim(),
        room,
        arrive,
        depart,
        why: why.trim(),
        travel: (travel || '').trim(),
        activities: (activities || '').trim(),
        ref,
      });
      if (calResult) {
        await db.update(bookings)
          .set({ calendarEventId: calResult.eventId })
          .where(eq(bookings.id, inserted.id));
      }
    } catch (calErr) {
      console.error('Calendar sync failed (non-fatal):', calErr instanceof Error ? calErr.message : calErr);
    }

    // Send notification email
    await sendBookingNotification({
      name: name.trim(),
      room,
      arrive,
      depart,
      why: why.trim(),
      travel: (travel || '').trim(),
      activities: (activities || '').trim(),
      ref,
    }).catch((emailErr: Error) => {
      console.error('Email notification failed (non-fatal):', emailErr.message);
    });

    return NextResponse.json({ ok: true as const, ref, id: inserted.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Booking failed:', message);
    return NextResponse.json(
      { ok: false as const, error: 'Something broke on our end. Try again?' },
      { status: 500 },
    );
  }
}
