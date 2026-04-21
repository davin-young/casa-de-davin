'use client';

import { useState } from 'react';
import { HouseGlyph } from './icons';
import { MossButton } from './shared';

interface SiteGateProps {
  onUnlock: () => void;
}

export default function SiteGate({ onUnlock }: SiteGateProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Enter your invite code.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/invite/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json() as { ok: boolean; error?: string };

      if (data.ok) {
        onUnlock();
        return;
      }

      setError('Invalid code.');
      setCode('');
    } catch {
      setError('Something broke. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--oat, #f2ead8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    }}>
      <div style={{
        maxWidth: 420,
        width: '100%',
        background: 'var(--linen, #e8dfc4)',
        border: '1.5px solid var(--umber-soft, #9b5a42)',
        borderRadius: '24px 8px 24px 8px',
        padding: '48px 44px 40px',
        boxShadow: '0 40px 80px -20px rgba(0,0,0,0.15)',
        textAlign: 'center',
        transform: 'rotate(-0.5deg)',
      }}>
        <div style={{ marginBottom: 24 }}>
          <HouseGlyph size={36} />
        </div>

        <h1 className="serif-display" style={{
          fontSize: 36,
          lineHeight: 1,
          margin: '0 0 8px',
          letterSpacing: '-0.02em',
          fontWeight: 500,
          color: 'var(--ink, #2b3524)',
        }}>
          Casa de <span style={{ fontStyle: 'italic', color: 'var(--umber, #7a3e2a)' }}>Davin.</span>
        </h1>

        <p style={{
          fontFamily: 'var(--serif)',
          fontSize: 16,
          color: 'var(--ink-soft, #3d4a33)',
          fontStyle: 'italic',
          margin: '0 0 28px',
          lineHeight: 1.5,
        }}>
          This site is invite-only.<br />
          Davin sent you a code. Type it here.
        </p>

        <form onSubmit={submit}>
          <input
            type="text"
            value={code}
            onChange={(e) => { setCode(e.target.value); setError(null); }}
            placeholder="INVITE CODE"
            maxLength={32}
            autoFocus
            style={{
              width: '100%',
              padding: '14px 18px',
              fontSize: 22,
              fontFamily: 'var(--mono, monospace)',
              fontWeight: 500,
              letterSpacing: '0.2em',
              textAlign: 'center',
              background: 'rgba(242,234,216,0.6)',
              border: '1.5px dashed var(--umber-soft, #9b5a42)',
              borderRadius: '12px 4px 12px 4px',
              color: 'var(--ink, #2b3524)',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />

          {error && (
            <div style={{
              marginTop: 12,
              fontSize: 13,
              color: 'var(--terracotta-deep, #a85e44)',
              fontFamily: 'var(--serif)',
              fontStyle: 'italic',
            }}>
              {error}
            </div>
          )}

          <MossButton
            onClick={() => {}}
            size="lg"
            disabled={loading || !code.trim()}
            style={{ width: '100%', justifyContent: 'center', marginTop: 18 }}
          >
            {loading ? 'Checking...' : 'Enter'}
          </MossButton>
        </form>

        <p className="hand" style={{
          fontSize: 18,
          color: 'var(--umber, #7a3e2a)',
          margin: '24px 0 0',
          transform: 'rotate(-1deg)',
        }}>
          no code? ask Davin. he&apos;ll probably say yes.
        </p>

      </div>
    </div>
  );
}
