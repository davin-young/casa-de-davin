import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: 'Google OAuth not configured' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const next = searchParams.get('next') || '/admin';

  // Generate CSRF state token and store in session
  const state = crypto.randomBytes(16).toString('hex');
  const session = await getSession();
  session.oauthState = state;
  session.oauthNext = next;
  await session.save();

  const redirectUri = `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/auth/google/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'online',
    prompt: 'select_account',
  });

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
}
