'use client';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--oat, #f2ead8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 40,
    }}>
      <div style={{
        maxWidth: 480,
        textAlign: 'center',
        background: 'var(--linen, #e8dfc4)',
        border: '1.5px solid rgba(122,62,42,0.25)',
        borderRadius: '24px 8px 24px 8px',
        padding: '48px 40px',
        boxShadow: '0 20px 60px -20px rgba(43,53,36,0.2)',
        position: 'relative',
      }}>
        <div style={{
          fontFamily: 'var(--serif, Georgia)',
          fontSize: 80,
          fontWeight: 600,
          color: 'var(--terracotta, #c97b5e)',
          lineHeight: 1,
          marginBottom: 16,
          opacity: 0.3,
        }}>
          500
        </div>

        <h1 style={{
          fontFamily: 'var(--serif, Georgia)',
          fontSize: 28,
          fontWeight: 500,
          color: 'var(--ink, #2b3524)',
          margin: '0 0 12px',
          lineHeight: 1.2,
        }}>
          Something broke.
        </h1>

        <p style={{
          fontFamily: 'var(--serif, Georgia)',
          fontSize: 16,
          fontStyle: 'italic',
          color: 'var(--ink-soft, #6b7a5e)',
          margin: '0 0 28px',
          lineHeight: 1.5,
        }}>
          Probably not your fault. The house is temperamental sometimes.
        </p>

        <button
          onClick={reset}
          style={{
            display: 'inline-block',
            padding: '12px 24px',
            background: 'var(--moss, #5a7d3a)',
            color: 'var(--oat, #f2ead8)',
            border: 'none',
            borderRadius: '10px 4px 10px 4px',
            fontSize: 14,
            fontFamily: 'var(--sans, sans-serif)',
            fontWeight: 600,
            cursor: 'pointer',
            letterSpacing: '0.04em',
          }}
        >
          Try again
        </button>
      </div>
    </div>
  );
}
