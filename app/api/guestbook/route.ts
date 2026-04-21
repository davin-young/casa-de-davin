import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { desc } from 'drizzle-orm';
import { db } from '@/db';
import { guestbookEntries, bookings } from '@/db/schema';
import { checkRateLimit } from '@/lib/rate-limit';
import { put } from '@vercel/blob';

// ── GET: List approved guestbook entries (public) ────────────────────

export async function GET() {
  try {
    const rows = await db
      .select()
      .from(guestbookEntries)
      .where(eq(guestbookEntries.status, 'approved'))
      .orderBy(desc(guestbookEntries.createdAt));

    const entries = rows.map(r => ({
      id: r.id,
      guestName: r.guestName,
      room: r.room,
      rating: r.rating,
      title: r.title,
      body: r.body,
      signoff: r.signoff,
      imageUrls: JSON.parse(r.imageUrls) as string[],
      createdAt: r.createdAt,
    }));

    return NextResponse.json({ ok: true, entries });
  } catch (err) {
    console.error('Failed to list guestbook entries:', err instanceof Error ? err.message : err);
    return NextResponse.json({ ok: false, error: 'Failed to fetch entries.' }, { status: 500 });
  }
}

// ── POST: Submit a guestbook entry with optional photos ──────────────

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';

  const rateResult = checkRateLimit(`guestbook:${ip}`);
  if (!rateResult.allowed) {
    return NextResponse.json({ ok: false, error: 'One review per minute.' }, { status: 429 });
  }

  try {
    const formData = await request.formData();

    const bookingRef = formData.get('bookingRef') as string;
    const rating = parseInt(formData.get('rating') as string, 10);
    const title = (formData.get('title') as string || '').trim();
    const body = (formData.get('body') as string || '').trim();
    const signoff = (formData.get('signoff') as string || '').trim();

    // Validate required fields
    if (!bookingRef) {
      return NextResponse.json({ ok: false, error: 'Booking ref is required.' }, { status: 400 });
    }
    if (!title || !body) {
      return NextResponse.json({ ok: false, error: 'Title and review are required.' }, { status: 400 });
    }
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ ok: false, error: 'Rating must be 1–5.' }, { status: 400 });
    }

    // Verify the booking ref exists and is approved
    const [booking] = await db
      .select({ name: bookings.name, room: bookings.room, status: bookings.status })
      .from(bookings)
      .where(eq(bookings.ref, bookingRef))
      .limit(1);

    if (!booking) {
      return NextResponse.json({ ok: false, error: 'Booking not found.' }, { status: 404 });
    }
    if (booking.status !== 'approved') {
      return NextResponse.json({ ok: false, error: 'Only approved guests can leave reviews.' }, { status: 403 });
    }

    // Check for duplicate review
    const [existing] = await db
      .select({ id: guestbookEntries.id })
      .from(guestbookEntries)
      .where(eq(guestbookEntries.bookingRef, bookingRef))
      .limit(1);

    if (existing) {
      return NextResponse.json({ ok: false, error: 'You already left a review for this booking.' }, { status: 409 });
    }

    // Upload photos to Vercel Blob
    const imageUrls: string[] = [];
    const photos = formData.getAll('photos') as File[];

    for (const photo of photos.slice(0, 4)) { // max 4 photos
      if (!(photo instanceof File) || photo.size === 0) continue;
      if (photo.size > 5 * 1024 * 1024) continue; // skip files > 5MB
      if (!photo.type.startsWith('image/')) continue;

      const blob = await put(
        `guestbook/${bookingRef}/${Date.now()}-${photo.name}`,
        photo,
        { access: 'public', addRandomSuffix: true },
      );
      imageUrls.push(blob.url);
    }

    // Create the entry
    const [entry] = await db.insert(guestbookEntries).values({
      bookingRef,
      guestName: booking.name,
      room: booking.room,
      rating,
      title,
      body,
      signoff,
      imageUrls: JSON.stringify(imageUrls),
      status: 'pending',
    }).returning({ id: guestbookEntries.id });

    return NextResponse.json({ ok: true, id: entry.id });
  } catch (err) {
    console.error('Guestbook submission failed:', err instanceof Error ? err.message : err);
    return NextResponse.json({ ok: false, error: 'Something went wrong.' }, { status: 500 });
  }
}
