'use client';

import React from 'react';

interface SunProps {
  size?: number;
  color?: string;
  filled?: boolean;
}

interface SunHalfProps {
  size?: number;
  color?: string;
}

interface SunRatingProps {
  value?: number;
  size?: number;
  color?: string;
}

interface LeafSprigProps {
  size?: number;
  color?: string;
  rotation?: number;
  opacity?: number;
}

interface SproutProps {
  size?: number;
  color?: string;
}

interface CouchGlyphProps {
  size?: number;
  color?: string;
}

interface BedGlyphProps {
  size?: number;
  color?: string;
}

interface ArrowProps {
  size?: number;
  color?: string;
}

interface HouseGlyphProps {
  size?: number;
  color?: string;
}

interface SunRayBurstProps {
  size?: number;
  color?: string;
  opacity?: number;
}

interface CheckIconProps {
  size?: number;
  color?: string;
}

interface XIconProps {
  size?: number;
  color?: string;
}

export const Sun: React.FC<SunProps> = ({ size = 20, color = 'currentColor', filled = true }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round">
    <circle cx="12" cy="12" r="4.5" fill={filled ? color : 'none'} stroke={color} />
    <g stroke={color}>
      <line x1="12" y1="2.5" x2="12" y2="5" />
      <line x1="12" y1="19" x2="12" y2="21.5" />
      <line x1="2.5" y1="12" x2="5" y2="12" />
      <line x1="19" y1="12" x2="21.5" y2="12" />
      <line x1="4.9" y1="4.9" x2="6.6" y2="6.6" />
      <line x1="17.4" y1="17.4" x2="19.1" y2="19.1" />
      <line x1="19.1" y1="4.9" x2="17.4" y2="6.6" />
      <line x1="6.6" y1="17.4" x2="4.9" y2="19.1" />
    </g>
  </svg>
);

export const SunHalf: React.FC<SunHalfProps> = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round">
    <defs>
      <clipPath id={`ch-${size}`}><rect x="0" y="0" width="12" height="24" /></clipPath>
    </defs>
    <g clipPath={`url(#ch-${size})`}>
      <circle cx="12" cy="12" r="4.5" fill={color} />
    </g>
    <circle cx="12" cy="12" r="4.5" stroke={color} />
    <g stroke={color}>
      <line x1="12" y1="2.5" x2="12" y2="5" />
      <line x1="12" y1="19" x2="12" y2="21.5" />
      <line x1="2.5" y1="12" x2="5" y2="12" />
      <line x1="19" y1="12" x2="21.5" y2="12" />
      <line x1="4.9" y1="4.9" x2="6.6" y2="6.6" />
      <line x1="17.4" y1="17.4" x2="19.1" y2="19.1" />
      <line x1="19.1" y1="4.9" x2="17.4" y2="6.6" />
      <line x1="6.6" y1="17.4" x2="4.9" y2="19.1" />
    </g>
  </svg>
);

export const SunRating: React.FC<SunRatingProps> = ({ value = 4.4, size = 16, color = 'var(--honey)' }) => {
  const full = Math.floor(value);
  const hasHalf = value - full >= 0.25 && value - full < 0.75;
  const extraFull = value - full >= 0.75 ? 1 : 0;
  return (
    <span style={{ display: 'inline-flex', gap: 2, alignItems: 'center' }}>
      {Array.from({ length: 5 }).map((_, i) => {
        if (i < full + extraFull) return <Sun key={i} size={size} color={color} filled />;
        if (i === full && hasHalf) return <SunHalf key={i} size={size} color={color} />;
        return <Sun key={i} size={size} color={color} filled={false} />;
      })}
    </span>
  );
};

export const LeafSprig: React.FC<LeafSprigProps> = ({ size = 60, color = 'var(--moss)', rotation = 0, opacity = 0.7 }) => (
  <svg width={size} height={size} viewBox="0 0 60 60" style={{ transform: `rotate(${rotation}deg)`, opacity }}>
    <g fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round">
      <path d="M30 55 Q 30 35 22 22 Q 16 14 14 8" />
      <ellipse cx="24" cy="30" rx="6" ry="3" transform="rotate(-35 24 30)" fill={color} fillOpacity="0.5"/>
      <ellipse cx="20" cy="20" rx="5" ry="2.5" transform="rotate(-50 20 20)" fill={color} fillOpacity="0.5"/>
      <ellipse cx="30" cy="40" rx="6" ry="3" transform="rotate(-20 30 40)" fill={color} fillOpacity="0.5"/>
      <ellipse cx="27" cy="48" rx="4" ry="2" transform="rotate(-10 27 48)" fill={color} fillOpacity="0.5"/>
    </g>
  </svg>
);

export const Sprout: React.FC<SproutProps> = ({ size = 28, color = 'var(--moss)' }) => (
  <svg width={size} height={size} viewBox="0 0 28 28">
    <path d="M14 26 L14 14" stroke={color} strokeWidth="1.4" strokeLinecap="round" fill="none" />
    <ellipse cx="9" cy="12" rx="5" ry="2.5" transform="rotate(-30 9 12)" fill={color} fillOpacity="0.75"/>
    <ellipse cx="19" cy="12" rx="5" ry="2.5" transform="rotate(30 19 12)" fill={color} fillOpacity="0.75"/>
  </svg>
);

export const CouchGlyph: React.FC<CouchGlyphProps> = ({ size = 80, color = 'var(--umber)' }) => (
  <svg width={size} height={size * 0.7} viewBox="0 0 80 56" fill="none" stroke={color} strokeWidth="1.4">
    <rect x="6" y="22" width="68" height="24" rx="6" fill="var(--terracotta)" fillOpacity="0.25"/>
    <rect x="9" y="14" width="18" height="14" rx="3" />
    <rect x="31" y="14" width="18" height="14" rx="3" />
    <rect x="53" y="14" width="18" height="14" rx="3" />
    <line x1="10" y1="46" x2="10" y2="52" />
    <line x1="70" y1="46" x2="70" y2="52" />
  </svg>
);

export const BedGlyph: React.FC<BedGlyphProps> = ({ size = 80, color = 'var(--umber)' }) => (
  <svg width={size} height={size * 0.7} viewBox="0 0 80 56" fill="none" stroke={color} strokeWidth="1.4">
    <rect x="6" y="10" width="68" height="10" rx="2" fill="var(--sage)" fillOpacity="0.3"/>
    <rect x="6" y="20" width="68" height="24" rx="4" fill="var(--linen-warm)" fillOpacity="0.6"/>
    <rect x="12" y="24" width="18" height="10" rx="2" fill="var(--oat)"/>
    <line x1="8" y1="44" x2="8" y2="50" />
    <line x1="72" y1="44" x2="72" y2="50" />
  </svg>
);

export const ArrowRight: React.FC<ArrowProps> = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="12" x2="20" y2="12" />
    <polyline points="14 6 20 12 14 18" />
  </svg>
);

export const ArrowLeft: React.FC<ArrowProps> = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <line x1="20" y1="12" x2="4" y2="12" />
    <polyline points="10 6 4 12 10 18" />
  </svg>
);

export const HouseGlyph: React.FC<HouseGlyphProps> = ({ size = 28, color = 'var(--umber)' }) => (
  <svg width={size} height={size} viewBox="0 0 28 28" fill="none" stroke={color} strokeWidth="1.4" strokeLinejoin="round">
    <path d="M4 13 L14 4 L24 13 L24 24 L4 24 Z" fill="var(--terracotta)" fillOpacity="0.3"/>
    <path d="M11 24 L11 16 L17 16 L17 24" />
    <path d="M2 14 L14 3 L26 14" strokeWidth="1.4"/>
  </svg>
);

export const SunRayBurst: React.FC<SunRayBurstProps> = ({ size = 400, color = 'var(--honey)', opacity = 0.2 }) => (
  <svg width={size} height={size} viewBox="0 0 400 400" style={{ opacity }}>
    <defs>
      <radialGradient id="sun-core">
        <stop offset="0%" stopColor={color} stopOpacity="0.9"/>
        <stop offset="40%" stopColor={color} stopOpacity="0.4"/>
        <stop offset="100%" stopColor={color} stopOpacity="0"/>
      </radialGradient>
    </defs>
    <circle cx="200" cy="200" r="200" fill="url(#sun-core)"/>
    <g stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.6" fill="none">
      {Array.from({ length: 18 }).map((_, i) => {
        const a = (i * 360) / 18;
        const x1 = 200 + Math.cos(a * Math.PI / 180) * 90;
        const y1 = 200 + Math.sin(a * Math.PI / 180) * 90;
        const x2 = 200 + Math.cos(a * Math.PI / 180) * 160;
        const y2 = 200 + Math.sin(a * Math.PI / 180) * 160;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
      })}
    </g>
  </svg>
);

export const CheckIcon: React.FC<CheckIconProps> = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 12 10 18 20 6" />
  </svg>
);

export const XIcon: React.FC<XIconProps> = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round">
    <line x1="6" y1="6" x2="18" y2="18"/>
    <line x1="18" y1="6" x2="6" y2="18"/>
  </svg>
);
