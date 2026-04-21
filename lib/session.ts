import { getIronSession, IronSession } from 'iron-session';
import { cookies } from 'next/headers';

export interface SessionData {
  isAdmin: boolean;
  isGuest: boolean;
  adminEmail?: string;
  oauthState?: string;
  oauthNext?: string;
}

const sessionOptions = {
  password: process.env.SESSION_SECRET || 'fallback-dev-secret-minimum-32-chars!!',
  cookieName: 'casa_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 30, // 1 month
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}
