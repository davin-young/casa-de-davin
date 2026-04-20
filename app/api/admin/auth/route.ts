import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

interface AdminAuthRequest {
  password: string;
}

interface AdminAuthResponse {
  ok: boolean;
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<AdminAuthResponse>> {
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
  }

  const { password } = body as AdminAuthRequest;
  const adminPassword = process.env.ADMIN_PASSWORD || 'sincerely';

  if (!password || password.trim().toLowerCase() !== adminPassword.toLowerCase()) {
    return NextResponse.json({ ok: false, error: 'Nope. Try again, sincerely.' }, { status: 401 });
  }

  const session = await getSession();
  session.isAdmin = true;
  await session.save();

  return NextResponse.json({ ok: true });
}
