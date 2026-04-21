'use client';

import { useState, useEffect } from 'react';
import { HouseGlyph } from '@/components/icons';
import { PaperSurface, SectionLabel } from '@/components/shared';

export default function AdminLoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authError = params.get('auth_error');
    if (authError) {
      const messages: Record<string, string> = {
        denied: 'Sign-in was cancelled.',
        not_authorized: 'That Google account isn\u2019t authorized as admin.',
        token_exchange: 'Google auth failed. Try again.',
        invalid_state: 'Session expired. Try again.',
        not_configured: 'Google OAuth isn\u2019t configured on the server.',
        missing_params: 'Something went wrong with the auth flow.',
      };
      setError(messages[authError] || 'Something went wrong.');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleLogin = () => {
    setLoading(true);
    setError(null);
    window.location.href = '/api/auth/google?next=/admin';
  };

  return (
    <PaperSurface style={{ minHeight: '100vh', padding: '80px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        maxWidth: 440,
        width: '100%',
        background: 'var(--linen)',
        border: '1.5px solid var(--umber-soft)',
        borderRadius: '20px 6px 20px 6px',
        padding: '38px 42px 34px',
        boxShadow: 'var(--shadow-lift)',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute',
          top: -14, left: 50,
          width: 90, height: 24,
          background: 'rgba(228,169,75,0.55)',
          border: '1px dashed rgba(122,62,42,0.3)',
          transform: 'rotate(-4deg)',
        }}/>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <HouseGlyph size={28}/>
          <span className="serif-display" style={{ fontSize: 16, fontWeight: 600 }}>Casa de Davin</span>
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.2em',
            textTransform: 'uppercase',
            padding: '3px 8px', marginLeft: 'auto',
            background: 'var(--umber)', color: 'var(--oat)',
            borderRadius: '6px 2px 6px 2px',
          }}>admin</span>
        </div>

        <SectionLabel>Staff entrance</SectionLabel>
        <h1 className="serif-display" style={{ fontSize: 40, lineHeight: 1, margin: '8px 0 8px', letterSpacing: '-0.02em' }}>
          Prove you&apos;re <span style={{ fontStyle: 'italic', color: 'var(--umber)' }}>me.</span>
        </h1>
        <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 15, color: 'var(--ink-soft)', margin: '0 0 22px' }}>
          Just a soft lock. If you&apos;re not Davin, close this tab, please and thank you.
        </p>

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            padding: '12px 20px',
            background: '#fff',
            border: '1.5px solid var(--umber-soft)',
            borderRadius: '12px 4px 12px 4px',
            cursor: loading ? 'wait' : 'pointer',
            fontFamily: 'var(--sans)',
            fontSize: 15,
            fontWeight: 500,
            color: 'var(--ink)',
            opacity: loading ? 0.6 : 1,
            transition: 'box-shadow 200ms ease, opacity 200ms ease',
          }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.boxShadow = 'var(--shadow-lift)'; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 010-9.18l-7.98-6.19a24.08 24.08 0 000 21.56l7.98-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          {loading ? 'Redirecting\u2026' : 'Sign in with Google'}
        </button>

        {error && (
          <div style={{ marginTop: 14, fontSize: 13, color: 'var(--terracotta-deep)', fontStyle: 'italic', fontFamily: 'var(--serif)' }}>
            {error}
          </div>
        )}
      </div>
    </PaperSurface>
  );
}
