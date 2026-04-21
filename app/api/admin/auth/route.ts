import { NextResponse } from 'next/server';

// Admin auth is handled exclusively via Google OAuth (/api/auth/google).
// This endpoint is intentionally disabled.
export async function POST(): Promise<NextResponse> {
  return NextResponse.json(
    { ok: false, error: 'Admin login is via Google only. Use /login.' },
    { status: 403 },
  );
}
