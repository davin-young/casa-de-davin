import { NextResponse } from 'next/server';
import { desc } from 'drizzle-orm';
import { getSession } from '@/lib/session';
import { db } from '@/db';
import { guestbookEntries } from '@/db/schema';

export async function GET() {
  const session = await getSession();
  if (!session.isAdmin) {
    return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const rows = await db
      .select()
      .from(guestbookEntries)
      .orderBy(desc(guestbookEntries.createdAt));

    const entries = rows.map(r => ({
      ...r,
      imageUrls: JSON.parse(r.imageUrls) as string[],
    }));

    return NextResponse.json({ ok: true, entries });
  } catch (err) {
    console.error('Failed to list guestbook entries:', err instanceof Error ? err.message : err);
    return NextResponse.json({ ok: false, error: 'Failed to fetch entries.' }, { status: 500 });
  }
}
