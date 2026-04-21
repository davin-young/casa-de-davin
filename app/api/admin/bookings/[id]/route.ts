import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/session';
import { db } from '@/db';
import { bookings } from '@/db/schema';
import { updateEventStatus } from '@/lib/google-calendar';
import { sendApprovalEmail, sendDeclineEmail } from '@/lib/email';
import type { BookingStatus } from '@/types/booking';

interface BookingUpdateRequest {
  status?: BookingStatus;
  notes?: string | null;
}

interface StatusUpdateResponse {
  ok: true;
}

interface ErrorResponse {
  ok: false;
  error: string;
}

function isValidStatus(status: string): status is BookingStatus {
  return status === 'pending' || status === 'approved' || status === 'declined';
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<StatusUpdateResponse | ErrorResponse>> {
  const session = await getSession();
  if (!session.isAdmin) {
    return NextResponse.json({ ok: false as const, error: 'Unauthorized.' }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ ok: false as const, error: 'Booking ID required.' }, { status: 400 });
  }

  try {
    const [deleted] = await db
      .delete(bookings)
      .where(eq(bookings.id, id))
      .returning({ id: bookings.id });

    if (!deleted) {
      return NextResponse.json({ ok: false as const, error: 'Booking not found.' }, { status: 404 });
    }

    return NextResponse.json({ ok: true as const });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Failed to delete booking:', message);
    return NextResponse.json(
      { ok: false as const, error: 'Failed to delete booking.' },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<StatusUpdateResponse | ErrorResponse>> {
  const session = await getSession();
  if (!session.isAdmin) {
    return NextResponse.json({ ok: false as const, error: 'Unauthorized.' }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ ok: false as const, error: 'Booking ID required.' }, { status: 400 });
  }

  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ ok: false as const, error: 'Invalid request body.' }, { status: 400 });
  }

  const { status, notes } = body as BookingUpdateRequest;

  // Validate: at least one field must be provided
  if (!status && notes === undefined) {
    return NextResponse.json(
      { ok: false as const, error: 'Provide status or notes to update.' },
      { status: 400 },
    );
  }

  if (status && !isValidStatus(status)) {
    return NextResponse.json(
      { ok: false as const, error: 'Status must be "pending", "approved", or "declined".' },
      { status: 400 },
    );
  }

  try {
    // Find booking in DB
    const [booking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, id))
      .limit(1);

    if (!booking) {
      return NextResponse.json({ ok: false as const, error: 'Booking not found.' }, { status: 404 });
    }

    // Build update object
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (status) updates.status = status;
    if (notes !== undefined) updates.notes = notes;

    await db
      .update(bookings)
      .set(updates)
      .where(eq(bookings.id, id));

    // Status-change side effects
    if (status) {
      // Optional: sync to Google Calendar
      if (booking.calendarEventId) {
        try {
          await updateEventStatus(booking.calendarEventId, status);
        } catch (calErr) {
          console.error('Calendar sync failed (non-fatal):', calErr instanceof Error ? calErr.message : calErr);
        }
      }

      // Send approval/decline email to guest if they provided an email
      if (booking.email) {
        const emailData = {
          name: booking.name,
          room: booking.room,
          arrive: booking.arrive,
          depart: booking.depart,
          why: booking.why,
          travel: booking.travel,
          activities: booking.activities,
          ref: booking.ref,
        };
        try {
          if (status === 'approved') {
            await sendApprovalEmail(emailData, booking.email);
          } else if (status === 'declined') {
            await sendDeclineEmail(emailData, booking.email);
          }
        } catch (emailErr) {
          console.error('Guest email failed (non-fatal):', emailErr instanceof Error ? emailErr.message : emailErr);
        }
      }
    }

    return NextResponse.json({ ok: true as const });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Failed to update booking status:', message);
    return NextResponse.json(
      { ok: false as const, error: 'Failed to update booking.' },
      { status: 500 },
    );
  }
}
