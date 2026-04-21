import { NextRequest, NextResponse } from 'next/server';
import { desc } from 'drizzle-orm';
import { db } from '@/db';
import { inviteCodes } from '@/db/schema';
import { getSession } from '@/lib/session';

const CHARSET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

function generateCode(length = 6): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => CHARSET[b % CHARSET.length]).join('');
}

export async function GET() {
  const session = await getSession();
  if (!session.isAdmin) {
    return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 });
  }

  const codes = await db
    .select()
    .from(inviteCodes)
    .orderBy(desc(inviteCodes.createdAt));

  return NextResponse.json({ ok: true, codes });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.isAdmin) {
    return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 });
  }

  const body = await req.json() as { note?: string; count?: number };
  const count = Math.min(Math.max(body.count ?? 1, 1), 10);
  const note = body.note?.trim() || null;

  const created = [];
  for (let i = 0; i < count; i++) {
    const code = generateCode();
    const [row] = await db
      .insert(inviteCodes)
      .values({ code, note })
      .returning();
    created.push(row);
  }

  return NextResponse.json({ ok: true, codes: created });
}
