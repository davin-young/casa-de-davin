import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { bookings } from '@/db/schema';
import { checkRateLimit } from '@/lib/rate-limit';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ref: string }> },
) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';

  const rateResult = checkRateLimit(`lookup:${ip}`);
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
      .select({
        name: bookings.name,
        room: bookings.room,
        arrive: bookings.arrive,
        depart: bookings.depart,
        status: bookings.status,
        createdAt: bookings.createdAt,
      })
      .from(bookings)
      .where(eq(bookings.ref, ref))
      .limit(1);

    if (!booking) {
      return NextResponse.json({ ok: false, error: 'Booking not found.' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, booking });
  } catch (err) {
    console.error('Booking lookup failed:', err instanceof Error ? err.message : err);
    return NextResponse.json(
      { ok: false, error: 'Something went wrong.' },
      { status: 500 },
    );
  }
}
