'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { PaperSurface, MossButton, SectionLabel, SprigDivider } from '@/components/shared';
import { HouseGlyph, CouchGlyph, BedGlyph } from '@/components/icons';

interface BookingData {
  name: string;
  room: 'couch' | 'bedroom';
  arrive: string;
  depart: string;
  status: 'pending' | 'approved' | 'declined';
  createdAt: string;
}

type FetchState = 'loading' | 'found' | 'not-found' | 'error';

export default function BookingLookupPage() {
  const { ref } = useParams<{ ref: string }>();
  const [state, setState] = useState<FetchState>('loading');
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    if (!ref) return;
    fetch(`/api/booking/${ref}`)
      .then(r => r.json())
      .then((data: { ok: boolean; booking?: BookingData }) => {
        if (data.ok && data.booking) {
          setBooking(data.booking);
          setState('found');
        } else {
          setState('not-found');
        }
      })
      .catch(() => setState('error'));
  }, [ref]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const res = await fetch(`/api/booking/${ref}/cancel`, { method: 'POST' });
      const data = await res.json() as { ok: boolean };
      if (data.ok) {
        setBooking(prev => prev ? { ...prev, status: 'declined' } : null);
        setShowCancelConfirm(false);
      }
    } catch {
      // silently fail
    } finally {
      setCancelling(false);
    }
  };

  if (state === 'loading') {
    return (
      <PaperSurface style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 18, fontStyle: 'italic', color: 'var(--ink-soft)' }}>
          Looking up your booking...
        </div>
      </PaperSurface>
    );
  }

  if (state === 'not-found') {
    return (
      <PaperSurface style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <h1 className="serif-display" style={{ fontSize: 36, margin: '0 0 12px', color: 'var(--ink)' }}>
            Booking not found
          </h1>
          <p style={{ fontFamily: 'var(--serif)', fontSize: 16, color: 'var(--ink-soft)', fontStyle: 'italic' }}>
            Double-check your ref code. It should look like CDD-XXXXX.
          </p>
        </div>
      </PaperSurface>
    );
  }

  if (state === 'error' || !booking) {
    return (
      <PaperSurface style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <h1 className="serif-display" style={{ fontSize: 36, margin: '0 0 12px', color: 'var(--ink)' }}>
            Something broke
          </h1>
          <p style={{ fontFamily: 'var(--serif)', fontSize: 16, color: 'var(--ink-soft)', fontStyle: 'italic' }}>
            Probably not your fault. Try refreshing.
          </p>
        </div>
      </PaperSurface>
    );
  }

  const nights = Math.round(
    (new Date(booking.depart).getTime() - new Date(booking.arrive).getTime()) / 86_400_000,
  );
  const roomLabel = booking.room === 'couch' ? 'The Couch' : 'The Bedroom';
  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' });

  const statusConfig = {
    pending: {
      color: 'var(--honey)',
      textColor: 'var(--ink)',
      label: 'PENDING',
      message: "Sit tight — Davin's reviewing your request. He's probably napping, but he'll get to it.",
    },
    approved: {
      color: 'var(--moss)',
      textColor: 'var(--oat)',
      label: 'APPROVED',
      message: "You're in! Pack your bags. Check-in details will come via text or email.",
    },
    declined: {
      color: 'var(--terracotta)',
      textColor: 'var(--oat)',
      label: 'DECLINED',
      message: "Sorry, not this time. Nothing personal — try different dates or reply to the email.",
    },
  };

  const sc = statusConfig[booking.status];

  return (
    <PaperSurface style={{ minHeight: '60vh', paddingBottom: 60 }}>
      <div style={{
        maxWidth: 640, margin: '40px auto 0',
        padding: '0 40px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <HouseGlyph size={22} />
          <span className="serif-display" style={{ fontSize: 16, fontWeight: 600 }}>Casa de Davin</span>
          <span style={{ flex: 1 }} />
          <span style={{
            fontFamily: 'var(--mono)',
            fontSize: 12,
            color: 'var(--ink-soft)',
            letterSpacing: '0.06em',
          }}>{ref}</span>
        </div>

        <article style={{
          background: 'var(--linen)',
          border: '1.5px solid var(--umber-soft)',
          borderRadius: '24px 8px 24px 8px',
          padding: '40px 40px 36px',
          boxShadow: '0 20px 60px -20px rgba(43,53,36,0.25)',
          position: 'relative',
        }}>
          {/* Status badge */}
          <div style={{
            position: 'absolute', top: 28, right: 32,
            padding: '8px 14px',
            background: sc.color,
            color: sc.textColor,
            borderRadius: '8px 3px 8px 3px',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.18em',
            transform: 'rotate(2deg)',
          }}>{sc.label}</div>

          <SectionLabel>Booking status</SectionLabel>

          <h1 className="serif-display" style={{
            fontSize: 42,
            lineHeight: 1.05,
            margin: '12px 0 8px',
            letterSpacing: '-0.02em',
            maxWidth: 380,
          }}>
            {booking.status === 'approved' ? (
              <>You&apos;re in,<br/><span style={{ fontStyle: 'italic', color: 'var(--moss)' }}>{booking.name}.</span></>
            ) : booking.status === 'declined' ? (
              <>Not this time,<br/><span style={{ fontStyle: 'italic', color: 'var(--terracotta)' }}>{booking.name}.</span></>
            ) : (
              <>Hang tight,<br/><span style={{ fontStyle: 'italic', color: 'var(--umber)' }}>{booking.name}.</span></>
            )}
          </h1>

          <p style={{
            fontFamily: 'var(--serif)',
            fontSize: 16,
            fontStyle: 'italic',
            color: 'var(--ink-soft)',
            margin: '0 0 24px',
            maxWidth: 420,
            lineHeight: 1.5,
          }}>
            {sc.message}
          </p>

          <SprigDivider />

          <div style={{ margin: '18px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 24px' }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--umber)', marginBottom: 3 }}>Room</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--serif)', fontSize: 18, color: 'var(--ink)' }}>
                {booking.room === 'couch' ? <CouchGlyph size={24} /> : <BedGlyph size={24} />}
                {roomLabel}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--umber)', marginBottom: 3 }}>Nights</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 18, color: 'var(--ink)' }}>{nights}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--umber)', marginBottom: 3 }}>Arrives</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 16, color: 'var(--ink)' }}>{fmtDate(booking.arrive)}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--umber)', marginBottom: 3 }}>Departs</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 16, color: 'var(--ink)' }}>{fmtDate(booking.depart)}</div>
            </div>
          </div>

          <SprigDivider />

          <div style={{
            marginTop: 14,
            fontSize: 12,
            color: 'var(--ink-soft)',
            fontStyle: 'italic',
          }}>
            Submitted {new Date(booking.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>

          {/* Cancel button — only for pending or approved */}
          {booking.status !== 'declined' && (
            <div style={{ marginTop: 24 }}>
              {showCancelConfirm ? (
                <div style={{
                  padding: '16px 18px',
                  background: 'rgba(201,123,94,0.08)',
                  border: '1px dashed var(--terracotta)',
                  borderRadius: '10px 4px 10px 4px',
                }}>
                  <p style={{ fontFamily: 'var(--serif)', fontSize: 15, color: 'var(--ink)', margin: '0 0 12px' }}>
                    Are you sure? This can&apos;t be undone.
                  </p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <MossButton onClick={handleCancel} variant="secondary" size="sm" disabled={cancelling}>
                      {cancelling ? 'Cancelling...' : 'Yes, cancel my booking'}
                    </MossButton>
                    <MossButton onClick={() => setShowCancelConfirm(false)} variant="ghost" size="sm">
                      Never mind
                    </MossButton>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--terracotta)',
                    fontFamily: 'var(--serif)',
                    fontSize: 14,
                    fontStyle: 'italic',
                    cursor: 'pointer',
                    padding: '4px 0',
                    textDecoration: 'underline',
                    textUnderlineOffset: 3,
                  }}
                >
                  Cancel my booking
                </button>
              )}
            </div>
          )}
        </article>
      </div>
    </PaperSurface>
  );
}
