import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';

interface SessionData {
  isAdmin: boolean;
  isGuest: boolean;
  adminEmail?: string;
  oauthState?: string;
  oauthNext?: string;
}

// Must match lib/session.ts exactly
const sessionOptions = {
  password: process.env.SESSION_SECRET || 'fallback-dev-secret-minimum-32-chars!!',
  cookieName: 'casa_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
  },
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow the admin auth (login) endpoint without a session
  if (pathname === '/api/admin/auth') {
    return NextResponse.next();
  }

  const response = NextResponse.next();

  let session: SessionData;
  try {
    session = await getIronSession<SessionData>(request, response, sessionOptions);
  } catch {
    if (pathname === '/admin') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.json({ ok: false, error: 'Unauthorized.' }, { status: 401 });
  }

  // Admin page → redirect to /login if not admin
  if (pathname === '/admin') {
    if (!session.isAdmin) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return response;
  }

  // Admin API routes → return 401 JSON if not admin
  if (pathname.startsWith('/api/admin/')) {
    if (!session.isAdmin) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized. Please log in.' },
        { status: 401 },
      );
    }
    return response;
  }

  return response;
}

export const config = {
  matcher: ['/admin', '/api/admin/:path*'],
};
