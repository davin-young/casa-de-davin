import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/session';
import { db } from '@/db';
import { guestbookEntries } from '@/db/schema';

// PATCH: approve or reject a guestbook entry
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session.isAdmin) {
    return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 });
  }

  const { id } = await params;
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ ok: false, error: 'Invalid body.' }, { status: 400 });
  }

  const { status } = body as { status: string };
  if (status !== 'approved' && status !== 'rejected' && status !== 'pending') {
    return NextResponse.json({ ok: false, error: 'Invalid status.' }, { status: 400 });
  }

  try {
    const [updated] = await db
      .update(guestbookEntries)
      .set({ status })
      .where(eq(guestbookEntries.id, id))
      .returning({ id: guestbookEntries.id });

    if (!updated) {
      return NextResponse.json({ ok: false, error: 'Entry not found.' }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Failed to update guestbook entry:', err instanceof Error ? err.message : err);
    return NextResponse.json({ ok: false, error: 'Failed to update.' }, { status: 500 });
  }
}

// DELETE: remove a guestbook entry
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session.isAdmin) {
    return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const [deleted] = await db
      .delete(guestbookEntries)
      .where(eq(guestbookEntries.id, id))
      .returning({ id: guestbookEntries.id });

    if (!deleted) {
      return NextResponse.json({ ok: false, error: 'Entry not found.' }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Failed to delete guestbook entry:', err instanceof Error ? err.message : err);
    return NextResponse.json({ ok: false, error: 'Failed to delete.' }, { status: 500 });
  }
}
