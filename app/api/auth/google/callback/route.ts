import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

interface GoogleTokenResponse {
  access_token: string;
  id_token: string;
  token_type: string;
}

interface GoogleUserInfo {
  email: string;
  name: string;
  picture: string;
}

export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(`${baseUrl}/login?auth_error=denied`);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${baseUrl}/login?auth_error=missing_params`);
  }

  // Verify CSRF state
  const session = await getSession();
  const savedState = session.oauthState;
  const next = session.oauthNext || '/admin';
  if (!savedState || savedState !== state) {
    return NextResponse.redirect(`${baseUrl}/login?auth_error=invalid_state`);
  }
  session.oauthState = undefined;
  session.oauthNext = undefined;

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${baseUrl}/api/auth/google/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${baseUrl}/login?auth_error=not_configured`);
  }

  // Exchange code for tokens
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${baseUrl}/login?auth_error=token_exchange`);
  }

  const tokens = await tokenRes.json() as GoogleTokenResponse;

  // Get user info
  const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });

  if (!userRes.ok) {
    return NextResponse.redirect(`${baseUrl}/login?auth_error=user_info`);
  }

  const user = await userRes.json() as GoogleUserInfo;

  // Check if this email is allowed as admin
  const allowedEmails = (process.env.GOOGLE_ADMIN_EMAILS || '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);

  if (allowedEmails.length === 0 || !allowedEmails.includes(user.email.toLowerCase())) {
    return NextResponse.redirect(`${baseUrl}/login?auth_error=not_authorized`);
  }

  // Set admin session
  session.isAdmin = true;
  session.isGuest = true;
  session.adminEmail = user.email;
  await session.save();

  return NextResponse.redirect(`${baseUrl}${next}`);
}
