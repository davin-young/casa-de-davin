import { NextRequest, NextResponse } from 'next/server';
import { eq, isNull, and } from 'drizzle-orm';
import { db } from '@/db';
import { inviteCodes } from '@/db/schema';
import { getSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  const body = await req.json() as { code?: string };
  const raw = (body.code ?? '').trim().toUpperCase();

  if (!raw || raw.length < 4) {
    return NextResponse.json({ ok: false, error: 'Enter your invite code.' }, { status: 400 });
  }

  // Dev bypass
  if (process.env.NODE_ENV === 'development' && raw === 'DEV') {
    const session = await getSession();
    session.isGuest = true;
    await session.save();
    return NextResponse.json({ ok: true });
  }

  // Check site password (grants guest access, NOT admin)
  const sitePassword = (process.env.SITE_PASSWORD || '').trim().toUpperCase();
  if (sitePassword && raw === sitePassword) {
    const session = await getSession();
    session.isGuest = true;
    await session.save();
    return NextResponse.json({ ok: true });
  }

  // Atomic: only update if not yet redeemed
  const [redeemed] = await db
    .update(inviteCodes)
    .set({
      redeemedAt: new Date(),
      redeemedBy: req.headers.get('x-forwarded-for') ?? 'unknown',
    })
    .where(and(eq(inviteCodes.code, raw), isNull(inviteCodes.redeemedAt)))
    .returning();

  if (!redeemed) {
    return NextResponse.json({ ok: false, error: 'Invalid or already used code.' }, { status: 401 });
  }

  const session = await getSession();
  session.isGuest = true;
  await session.save();

  return NextResponse.json({ ok: true });
}
