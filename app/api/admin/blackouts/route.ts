import { NextRequest, NextResponse } from 'next/server';
import { desc } from 'drizzle-orm';
import { getSession } from '@/lib/session';
import { db } from '@/db';
import { blackoutDates } from '@/db/schema';

export async function GET() {
  const session = await getSession();
  if (!session.isAdmin) {
    return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const rows = await db
      .select()
      .from(blackoutDates)
      .orderBy(desc(blackoutDates.createdAt));

    return NextResponse.json({ ok: true, blackouts: rows });
  } catch (err) {
    console.error('Failed to list blackouts:', err instanceof Error ? err.message : err);
    return NextResponse.json({ ok: false, error: 'Failed to fetch blackouts.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session.isAdmin) {
    return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 });
  }

  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ ok: false, error: 'Invalid request body.' }, { status: 400 });
  }

  const { startDate, endDate, label, room } = body as {
    startDate: string;
    endDate: string;
    label: string;
    room?: 'couch' | 'bedroom' | null;
  };

  if (!startDate || !endDate || !label) {
    return NextResponse.json({ ok: false, error: 'Start date, end date, and label are required.' }, { status: 400 });
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
    return NextResponse.json({ ok: false, error: 'Dates must be YYYY-MM-DD format.' }, { status: 400 });
  }

  if (startDate > endDate) {
    return NextResponse.json({ ok: false, error: 'Start date must be before end date.' }, { status: 400 });
  }

  try {
    const [inserted] = await db.insert(blackoutDates).values({
      startDate,
      endDate,
      label: label.trim(),
      room: room || null,
    }).returning();

    return NextResponse.json({ ok: true, blackout: inserted });
  } catch (err) {
    console.error('Failed to create blackout:', err instanceof Error ? err.message : err);
    return NextResponse.json({ ok: false, error: 'Failed to create blackout.' }, { status: 500 });
  }
}
