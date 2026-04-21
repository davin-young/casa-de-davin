import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/session';
import { db } from '@/db';
import { blackoutDates } from '@/db/schema';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session.isAdmin) {
    return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ ok: false, error: 'Blackout ID required.' }, { status: 400 });
  }

  try {
    const [deleted] = await db
      .delete(blackoutDates)
      .where(eq(blackoutDates.id, id))
      .returning({ id: blackoutDates.id });

    if (!deleted) {
      return NextResponse.json({ ok: false, error: 'Blackout not found.' }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Failed to delete blackout:', err instanceof Error ? err.message : err);
    return NextResponse.json({ ok: false, error: 'Failed to delete blackout.' }, { status: 500 });
  }
}
