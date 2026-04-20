'use client';

import { useState, useEffect } from 'react';
import { Sun } from './icons';
import { MossButton } from './shared';

export const STAMP_POOL = [
  'PENDING VIBES', 'LIKELY YES', 'WILL CONSULT THE PLANTS', 'PROBABLY FINE',
  'MAYBE NEXT YEAR', 'IF VIBES PERMIT', 'CHECK BACK AFTER THE NAP',
  'UNDER REVIEW', 'COUCH PENDING FLUFF', 'SOFT YES',
];

interface AnnotationProps {
  text: React.ReactNode;
  top?: number | string;
  left?: number | string;
  right?: number | string;
  bottom?: number | string;
  rotate?: number;
  arrow?: 'none' | 'left' | 'right' | 'down';
  width?: number | string;
  color?: string;
}

export function Annotation({ text, top, left, right, bottom, rotate = -4, arrow = 'none', width = 180, color = 'var(--umber)' }: AnnotationProps) {
  return (
    <div style={{
      position: 'absolute',
      top, left, right, bottom,
      width,
      fontFamily: 'var(--hand)',
      fontSize: 22,
      color,
      lineHeight: 1.05,
      transform: `rotate(${rotate}deg)`,
      pointerEvents: 'none',
      zIndex: 5,
    }}>
      {arrow === 'left' && (
        <svg width="40" height="30" viewBox="0 0 40 30" style={{ position: 'absolute', left: -36, top: 10 }}>
          <path d="M38 15 Q 25 18 15 14 Q 6 10 2 14" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          <path d="M8 8 L2 14 L10 18" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
      {arrow === 'right' && (
        <svg width="40" height="30" viewBox="0 0 40 30" style={{ position: 'absolute', right: -36, top: 10 }}>
          <path d="M2 15 Q 15 18 25 14 Q 34 10 38 14" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          <path d="M32 8 L38 14 L30 18" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
      {arrow === 'down' && (
        <svg width="26" height="50" viewBox="0 0 26 50" style={{ position: 'absolute', left: 30, top: 22 }}>
          <path d="M13 2 Q 8 18 14 30 Q 18 40 13 48" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          <path d="M7 42 L13 48 L19 42" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
      {text}
    </div>
  );
}

interface WaxSealProps {
  text?: string;
  top?: number | string;
  right?: number | string;
  bottom?: number | string;
  left?: number | string;
  rotate?: number;
}

export function WaxSeal({ text = 'Inspected · approved', top, right, bottom, left, rotate = 8 }: WaxSealProps) {
  return (
    <div style={{
      position: 'absolute',
      top, right, bottom, left,
      width: 86, height: 86,
      borderRadius: '50%',
      background: 'radial-gradient(circle at 35% 35%, #d37050 0%, #a84830 55%, #7a3e2a 100%)',
      color: 'var(--oat)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      fontFamily: 'var(--sans)',
      fontSize: 9,
      fontWeight: 700,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      padding: 8,
      lineHeight: 1.15,
      transform: `rotate(${rotate}deg)`,
      boxShadow: '0 6px 14px -4px rgba(122,62,42,0.5), inset 0 -4px 10px rgba(0,0,0,0.25), inset 0 4px 8px rgba(255,255,255,0.15)',
      zIndex: 4,
      pointerEvents: 'none',
    }}>
      <span>{text}</span>
    </div>
  );
}

interface FlickerPriceProps {
  prices?: string[];
}

export function FlickerPrice({ prices = ['$0', '1 compliment', '½ a story', '(1) meme', 'a good rec'] }: FlickerPriceProps) {
  const [idx, setIdx] = useState(0);
  const [hover, setHover] = useState(false);
  useEffect(() => {
    if (!hover) { setIdx(0); return; }
    const t = setInterval(() => setIdx(i => (i + 1) % prices.length), 480);
    return () => clearInterval(t);
  }, [hover, prices.length]);
  return (
    <span
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="serif-display"
      style={{
        fontSize: 30,
        color: 'var(--umber)',
        fontWeight: 600,
        display: 'inline-block',
        minWidth: 110,
        transition: 'color 200ms ease',
        cursor: 'help',
      }}
    >
      {prices[idx]}
    </span>
  );
}

export function WeatherChip() {
  const readings = [
    'Denver: 67° and smug',
    'vibes: passable',
    'slight chance of pasta',
    '72°, mild guilt',
    'sunny, mostly deserved',
  ];
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI(x => (x + 1) % readings.length), 3200);
    return () => clearInterval(t);
  }, []);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 10px',
      background: 'rgba(228,169,75,0.25)',
      border: '1px dashed var(--umber-soft)',
      borderRadius: '10px 4px 10px 4px',
      fontSize: 12,
      color: 'var(--umber)',
      fontStyle: 'italic',
      fontFamily: 'var(--serif)',
    }}>
      <Sun size={11} color="currentColor"/>
      {readings[i]}
    </span>
  );
}

interface PleaButtonProps {
  children: React.ReactNode;
  silly?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function PleaButton({ children, silly, onClick, disabled, size = 'lg' }: PleaButtonProps) {
  const [hover, setHover] = useState(false);
  const quips = ['this won\'t hurt much', 'he\'s harmless', 'probably fine', 'brave of you', 'the plants approve'];
  const [qi, setQi] = useState(0);
  useEffect(() => {
    if (!hover || !silly) return;
    const t = setInterval(() => setQi(i => (i + 1) % quips.length), 900);
    return () => clearInterval(t);
  }, [hover, silly]);
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}>
      <MossButton onClick={onClick} disabled={disabled} size={size}>
        {children}
      </MossButton>
      {silly && hover && !disabled && (
        <div style={{
          position: 'absolute',
          top: -38, right: 10,
          fontFamily: 'var(--hand)',
          fontSize: 20,
          color: 'var(--umber)',
          whiteSpace: 'nowrap',
          transform: 'rotate(-3deg)',
          pointerEvents: 'none',
        }}>
          ↓ {quips[qi]}
        </div>
      )}
    </div>
  );
}

export function FeaturedIn() {
  const outlets = ['Couch Weekly', 'Denver Micro-Host Gazette', "My Mom's Fridge (2019)", 'Tea Enthusiast Monthly', 'Plant-Approved Living'];
  return (
    <section style={{
      marginBottom: 36,
      padding: '20px 26px',
      background: 'rgba(232,223,196,0.45)',
      border: '1px dashed var(--umber-soft)',
      borderRadius: '14px 6px 14px 6px',
    }}>
      <div style={{
        fontSize: 10, fontWeight: 600,
        letterSpacing: '0.18em', textTransform: 'uppercase',
        color: 'var(--umber)', marginBottom: 10, opacity: 0.8,
      }}>As featured in (allegedly)</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 26px', alignItems: 'baseline' }}>
        {outlets.map((o, i) => (
          <span key={o} className="serif-display" style={{
            fontSize: 20,
            color: 'var(--ink-soft)',
            fontStyle: i % 2 ? 'italic' : 'normal',
            opacity: 0.8,
          }}>{o}</span>
        ))}
      </div>
    </section>
  );
}

export function TrustAndSafety() {
  return (
    <section style={{
      display: 'flex',
      alignItems: 'center',
      gap: 22,
      padding: '22px 26px',
      background: 'var(--linen)',
      border: '1.5px solid var(--umber-soft)',
      borderRadius: '16px 6px 16px 6px',
      marginBottom: 36,
    }}>
      <div style={{
        width: 72, height: 72,
        borderRadius: '14px 6px 14px 6px',
        background: 'var(--moss)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        border: '1.5px solid var(--moss-dark)',
      }}>
        <svg width="50" height="50" viewBox="0 0 50 50">
          <path d="M25 46 L25 22" stroke="#f2ead8" strokeWidth="1.5" fill="none"/>
          <ellipse cx="17" cy="18" rx="9" ry="4" transform="rotate(-30 17 18)" fill="#f2ead8" opacity="0.85"/>
          <ellipse cx="33" cy="14" rx="9" ry="4" transform="rotate(30 33 14)" fill="#f2ead8" opacity="0.85"/>
          <ellipse cx="15" cy="30" rx="7" ry="3" transform="rotate(-20 15 30)" fill="#f2ead8" opacity="0.7"/>
          <ellipse cx="35" cy="28" rx="7" ry="3" transform="rotate(20 35 28)" fill="#f2ead8" opacity="0.7"/>
          <rect x="18" y="42" width="14" height="6" fill="#c97b5e" rx="1"/>
        </svg>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: 10, fontWeight: 600, letterSpacing: '0.18em',
          textTransform: 'uppercase', color: 'var(--umber)', marginBottom: 4,
        }}>Trust &amp; Safety</div>
        <div className="serif-display" style={{ fontSize: 22, color: 'var(--ink)', fontWeight: 500, marginBottom: 4 }}>
          Meet <span style={{ fontStyle: 'italic' }}>the fiddle-leaf fig.</span> <span style={{ color: 'var(--ink-soft)', fontSize: 17 }}>This is the whole department.</span>
        </div>
        <div style={{ fontSize: 13, color: 'var(--ink-soft)', fontStyle: 'italic' }}>
          Conflict resolution: dramatic leaf drop. Arbitration binding.
        </div>
      </div>
      <span className="hand" style={{ fontSize: 24, color: 'var(--umber)', transform: 'rotate(-3deg)' }}>
        she&apos;s incorruptible
      </span>
    </section>
  );
}

export function AllYesFAQ() {
  const qs = [
    'Is the Wi-Fi fast?',
    'Can I bring snacks?',
    'Will the plants judge me?',
    'Is there coffee?',
    'Will the kettle be on?',
    'Should I bring a housewarming thing?',
  ];
  return (
    <section style={{
      marginBottom: 36,
      padding: '22px 26px',
      border: '1px dashed var(--umber-soft)',
      borderRadius: '14px 6px 14px 6px',
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 14 }}>
        <h3 className="serif-display" style={{ fontSize: 24, margin: 0, fontWeight: 500 }}>FAQ</h3>
        <span className="hand" style={{ fontSize: 20, color: 'var(--umber-soft)' }}>every answer is yes</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 28px' }}>
        {qs.map(q => (
          <div key={q} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '6px 0', borderBottom: '1px dotted var(--umber-soft)' }}>
            <span style={{ fontFamily: 'var(--serif)', fontSize: 15, color: 'var(--ink)' }}>{q}</span>
            <span className="hand" style={{ fontSize: 22, color: 'var(--moss)' }}>yes</span>
          </div>
        ))}
      </div>
    </section>
  );
}
