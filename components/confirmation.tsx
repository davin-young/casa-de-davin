'use client';

import { useState, useMemo, CSSProperties, useCallback } from 'react';
import { HouseGlyph, SunRayBurst, Sprout, ArrowRight } from './icons';
import { PaperSurface, MossButton, SectionLabel, SprigDivider, COPY } from './shared';
import { STAMP_POOL } from './silly';
import { SeedGlyph } from './form';

import type { Booking } from './form';

type ParticleDensity = 'light' | 'normal' | 'heavy';

type ParticleKind = 'leaf' | 'sprout' | 'sun' | 'seed' | 'dot' | 'leaf-pair';

interface Particle {
  id: number;
  x: number;
  delay: number;
  dur: number;
  rot: number;
  kind: ParticleKind;
  color: string;
  size: number;
}

interface ConfirmationProps {
  booking: Booking | null;
  onBackToRooms: () => void;
  onBookOther: () => void;
  particleDensity?: ParticleDensity;
  onShare: () => void;
}

interface ReceiptLineProps {
  label: string;
  value: string;
}

interface SeedPacketProps {
  kind: ParticleKind;
  color: string;
  size?: number;
}

export default function Confirmation({ booking, onBackToRooms, onBookOther, particleDensity = 'normal', onShare }: ConfirmationProps) {
  const densityMap: Record<ParticleDensity, number> = { light: 14, normal: 26, heavy: 44 };
  const count = densityMap[particleDensity];
  const prefersReduced = typeof window !== 'undefined' &&
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const kinds: ParticleKind[] = ['leaf', 'sprout', 'sun', 'seed', 'dot', 'leaf-pair'];
  const colors = ['var(--moss)', 'var(--terracotta)', 'var(--honey)', 'var(--umber)', 'var(--sage)'];

  const particles = useMemo<Particle[]>(() => Array.from({ length: prefersReduced ? 0 : count }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 4,
    dur: 5 + Math.random() * 4,
    rot: (Math.random() * 360) - 180,
    kind: kinds[i % 6],
    color: colors[i % 5],
    size: 18 + Math.random() * 14,
  })), [count, prefersReduced]);

  return (
    <PaperSurface style={{ minHeight: '100%', position: 'relative', overflow: 'hidden', paddingBottom: 60 }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {particles.map(p => (
          <div key={p.id}
            style={{
              position: 'absolute',
              left: `${p.x}%`,
              top: '-40px',
              animation: `seed-fall ${p.dur}s ${p.delay}s linear infinite`,
              '--r': `${p.rot}deg`,
            } as CSSProperties}>
            <SeedPacket kind={p.kind} color={p.color} size={p.size}/>
          </div>
        ))}
      </div>

      <div style={{ position: 'absolute', top: -120, right: -80, pointerEvents: 'none' }}>
        <SunRayBurst size={500} color="var(--honey)" opacity={0.22}/>
      </div>

      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '22px 40px 10px',
        maxWidth: 1040, margin: '0 auto',
        position: 'relative', zIndex: 2,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <HouseGlyph size={22}/>
          <span className="serif-display" style={{ fontSize: 16, fontWeight: 600 }}>Casa de Davin</span>
        </div>
        <span className="hand" style={{ fontSize: 22, color: 'var(--umber)', transform: 'rotate(-2deg)', display: 'inline-block' }}>
          received ✓
        </span>
      </div>

      <div style={{
        maxWidth: 680, margin: '40px auto 0',
        padding: '0 40px',
        position: 'relative', zIndex: 2,
      }}>
        <article style={{
          position: 'relative',
          background: 'var(--linen)',
          border: '1.5px solid var(--umber-soft)',
          borderRadius: '24px 8px 24px 8px',
          padding: '52px 48px 44px',
          boxShadow: '0 28px 80px -24px rgba(43,53,36,0.35)',
        }}>
          <PendingStamp/>

          <div style={{
            position: 'absolute', top: -1, left: 60, right: 60, height: 2,
            borderTop: '2px dashed var(--umber-soft)', opacity: 0.4,
          }}/>

          <SectionLabel>Confirmation slip</SectionLabel>

          <h1 className="serif-display" style={{
            fontSize: 56,
            lineHeight: 1.02,
            margin: '14px 0 10px',
            letterSpacing: '-0.02em',
            maxWidth: 420,
          }}>
            Request sent<br/>
            <span style={{ fontStyle: 'italic', color: 'var(--umber)' }}>into the void.</span>
          </h1>

          <p style={{
            fontFamily: 'var(--serif)',
            fontSize: 19,
            lineHeight: 1.5,
            color: 'var(--ink-soft)',
            margin: '0 0 28px',
            maxWidth: 460,
            fontStyle: 'italic',
          }}>
            I&apos;ll get back to you in 2–7 business naps. If you don&apos;t hear from me in a week, I&apos;m either out of cell service or pretending to be.
          </p>

          <SprigDivider/>

          <div style={{ margin: '18px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 24px' }}>
            <ReceiptLine label="Guest" value={booking?.name || '—'}/>
            <ReceiptLine label="Room" value={booking?.room === 'couch' ? 'The Couch' : 'The Bedroom'}/>
            <ReceiptLine label="Arrives" value={booking?.range?.start ? booking.range.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}/>
            <ReceiptLine label="Departs" value={booking?.range?.end ? booking.range.end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}/>
          </div>

          <SprigDivider/>

          {booking?.ref && <BookingRefBlock ref_={booking.ref} />}

          <div style={{
            marginTop: 18,
            fontFamily: 'var(--mono)',
            fontSize: 11,
            color: 'var(--ink-soft)',
            opacity: 0.7,
            letterSpacing: '0.04em',
          }}>
            $ calendar.create(event) → ok<br/>
            $ mail.send(davin@…) → ok<br/>
            $ ball.in(court: &quot;davin&quot;) → ok
          </div>

          <div style={{ display: 'flex', gap: 14, marginTop: 34, flexWrap: 'wrap' }}>
            <MossButton onClick={onBookOther} variant="primary" size="md">
              Book the other room too <ArrowRight size={16}/>
            </MossButton>
            <MossButton onClick={onShare} variant="secondary" size="md">
              📅 Add to my calendar
            </MossButton>
            <MossButton onClick={onBackToRooms} variant="secondary" size="md">
              Back to the house
            </MossButton>
          </div>
        </article>

        <div style={{
          marginTop: 28,
          padding: '18px 22px',
          background: 'rgba(232,223,196,0.5)',
          border: '1px dashed var(--umber-soft)',
          borderRadius: '14px 6px 14px 6px',
          display: 'flex', gap: 18, alignItems: 'flex-start',
        }}>
          <Sprout size={28}/>
          <div>
            <div className="hand" style={{ fontSize: 22, color: 'var(--umber)', marginBottom: 4 }}>what happens now</div>
            <div style={{ fontSize: 14, color: 'var(--ink)', lineHeight: 1.55, maxWidth: 460 }}>
              Your request is a tentative event on my calendar. I&apos;ll get an email. I&apos;ll probably reply from bed. If I forget, text me — I&apos;m only a human, and occasionally less than that.
            </div>
          </div>
        </div>

        <div style={{
          textAlign: 'center',
          color: 'var(--ink-soft)',
          opacity: 0.6,
          fontSize: 12,
          marginTop: 36,
          fontStyle: 'italic',
        }}>
          Built by Davin. Hosted by Davin. Judged by Davin.
        </div>
      </div>
    </PaperSurface>
  );
}

function ReceiptLine({ label, value }: ReceiptLineProps) {
  return (
    <div>
      <div style={{
        fontSize: 10, fontWeight: 600,
        letterSpacing: '0.18em', textTransform: 'uppercase',
        color: 'var(--umber)', opacity: 0.8, marginBottom: 3,
      }}>{label}</div>
      <div style={{ fontFamily: 'var(--serif)', fontSize: 18, color: 'var(--ink)' }}>{value}</div>
    </div>
  );
}

function PendingStamp() {
  const pool: string[] = STAMP_POOL || COPY.pendingStamps;
  const [stamp] = useState<string>(() => pool[Math.floor(Math.random() * pool.length)]);
  return (
    <div style={{
      position: 'absolute',
      top: 32,
      right: 36,
      '--rot': '5deg',
      animation: 'stamp-in 620ms cubic-bezier(.2,.9,.3,1.2) forwards',
      transform: 'rotate(5deg)',
      padding: '10px 14px',
      border: '2.5px solid var(--umber)',
      borderRadius: 6,
      color: 'var(--umber)',
      fontFamily: 'var(--sans)',
      fontWeight: 700,
      fontSize: 14,
      letterSpacing: '0.18em',
      textTransform: 'uppercase',
      opacity: 0.85,
      background: 'rgba(122,62,42,0.04)',
      boxShadow: 'inset 0 0 0 2px rgba(122,62,42,0.12)',
      maxWidth: 140,
      textAlign: 'center',
      lineHeight: 1.2,
    } as CSSProperties}>
      {stamp}
    </div>
  );
}

function BookingRefBlock({ ref_ }: { ref_: string }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== 'undefined' ? `${window.location.origin}/booking/${ref_}` : `/booking/${ref_}`;

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [url]);

  return (
    <div style={{
      marginTop: 18,
      padding: '14px 16px',
      background: 'rgba(90,125,58,0.06)',
      border: '1.5px dashed var(--moss)',
      borderRadius: '10px 4px 10px 4px',
    }}>
      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--moss)', marginBottom: 6 }}>
        Your booking ref
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span style={{
          fontFamily: 'var(--mono)',
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: '0.12em',
          color: 'var(--moss)',
        }}>{ref_}</span>
        <button onClick={handleCopy} style={{
          background: copied ? 'var(--moss)' : 'transparent',
          border: `1.5px solid ${copied ? 'var(--moss)' : 'var(--umber-soft)'}`,
          color: copied ? 'var(--oat)' : 'var(--ink-soft)',
          padding: '4px 10px',
          borderRadius: '6px 2px 6px 2px',
          fontSize: 11,
          fontFamily: 'var(--sans)',
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}>
          {copied ? 'Copied!' : 'Copy link'}
        </button>
      </div>
      <div style={{ fontSize: 12, color: 'var(--ink-soft)', fontStyle: 'italic', marginTop: 6 }}>
        Bookmark this to check your status anytime.
      </div>
    </div>
  );
}

function SeedPacket({ kind, color, size = 22 }: SeedPacketProps) {
  return (
    <div style={{
      width: size, height: size * 1.3,
      background: 'var(--oat)',
      border: `1.5px solid ${color}`,
      borderRadius: '4px 2px 4px 2px',
      boxShadow: '0 2px 4px -2px rgba(0,0,0,0.15)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: 4,
        background: color,
        opacity: 0.6,
      }}/>
      <SeedGlyph kind={kind} color={color} size={size * 0.6}/>
    </div>
  );
}
