'use client';

import React, { useState } from 'react';
import { Sprout, SunRating } from './icons';
export { SunRating };

export const COPY = {
  loading: [
    'Consulting the house spirits…',
    'Checking if I\'m free…',
    'Dusting off the couch…',
    'Watering Francine so she stops yelling…',
  ],
  pendingStamps: ['PENDING VIBES', 'LIKELY YES', 'CONSULTING THE PLANTS', 'PROBABLY FINE'],
};

interface PaperSurfaceProps {
  children: React.ReactNode;
  tone?: 'oat' | 'linen' | 'linen-warm';
  style?: React.CSSProperties;
}

export function PaperSurface({ children, tone = 'oat', style = {}, ...rest }: PaperSurfaceProps & Omit<React.HTMLAttributes<HTMLDivElement>, keyof PaperSurfaceProps>) {
  const bg = tone === 'linen' ? 'var(--linen)' : tone === 'linen-warm' ? 'var(--linen-warm)' : 'var(--oat)';
  return (
    <div style={{ position: 'relative', background: bg, ...style }} {...rest}>
      <div className="paper-noise" style={{
        backgroundImage: 'url("data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22 seed=%224%22/><feColorMatrix values=%220 0 0 0 0.17 0 0 0 0 0.21 0 0 0 0 0.14 0 0 0 0.25 0%22/></filter><rect width=%22200%22 height=%22200%22 filter=%22url(%23n)%22/></svg>")',
      }} />
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  );
}

type MossButtonSize = 'sm' | 'md' | 'lg';
type MossButtonVariant = 'primary' | 'secondary' | 'ghost';

interface MossButtonProps {
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  size?: MossButtonSize;
  variant?: MossButtonVariant;
  disabled?: boolean;
  style?: React.CSSProperties;
}

export function MossButton({ children, onClick, size = 'md', variant = 'primary', disabled, style = {}, ...rest }: MossButtonProps & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof MossButtonProps>) {
  const [hover, setHover] = useState(false);
  const [press, setPress] = useState(false);
  const sizeStyles: Record<MossButtonSize, React.CSSProperties> = {
    sm: { padding: '9px 16px', fontSize: 13 },
    md: { padding: '13px 22px', fontSize: 15 },
    lg: { padding: '16px 28px', fontSize: 16 },
  };

  const variantStyles: Record<MossButtonVariant, { bg: string; color: string; border: string }> = {
    primary: {
      bg: hover ? 'var(--moss-dark)' : 'var(--moss)',
      color: 'var(--oat)',
      border: '1.5px solid var(--moss-dark)',
    },
    secondary: {
      bg: hover ? 'var(--linen-warm)' : 'transparent',
      color: 'var(--umber)',
      border: '1.5px solid var(--umber-soft)',
    },
    ghost: {
      bg: hover ? 'rgba(122,62,42,0.06)' : 'transparent',
      color: 'var(--umber)',
      border: '1.5px solid transparent',
    },
  };

  const currentSize = sizeStyles[size];
  const currentVariant = variantStyles[variant];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPress(false); }}
      onMouseDown={() => setPress(true)}
      onMouseUp={() => setPress(false)}
      style={{
        fontFamily: 'var(--sans)',
        fontWeight: 500,
        letterSpacing: '0.005em',
        background: currentVariant.bg,
        color: currentVariant.color,
        border: currentVariant.border,
        borderRadius: '14px 10px 14px 10px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transform: press ? 'translateY(1px)' : hover ? 'translateY(-1px)' : 'translateY(0)',
        transition: 'transform 180ms ease-out, background 180ms ease-out, box-shadow 220ms ease-out',
        boxShadow: hover && variant === 'primary'
          ? '0 10px 24px -10px rgba(228,169,75,0.55), 0 2px 6px -2px rgba(43,53,36,0.3)'
          : 'none',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        ...currentSize,
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}

interface SectionLabelProps {
  children: React.ReactNode;
  color?: string;
}

export function SectionLabel({ children, color = 'var(--umber)' }: SectionLabelProps) {
  return (
    <div style={{
      fontFamily: 'var(--sans)',
      fontSize: 11,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.18em',
      color,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
    }}>
      <span style={{ width: 18, height: 1, background: 'currentColor', opacity: 0.5 }}/>
      {children}
    </div>
  );
}

interface ToastProps {
  children: React.ReactNode;
}

export function Toast({ children }: ToastProps) {
  return (
    <div style={{
      position: 'fixed',
      bottom: 28,
      right: 28,
      background: 'var(--linen-warm)',
      border: '1.5px solid var(--umber-soft)',
      borderRadius: '3px 12px 3px 12px',
      padding: '14px 20px',
      fontFamily: 'var(--hand)',
      fontSize: 20,
      color: 'var(--umber)',
      boxShadow: '0 8px 24px -8px rgba(43,53,36,0.25)',
      animation: 'toast-in 320ms cubic-bezier(.2,.9,.3,1.2) forwards',
      transform: 'rotate(-2deg)',
      maxWidth: 320,
      zIndex: 200,
    }}>
      <div style={{
        position: 'absolute', top: -1, right: -1,
        width: 18, height: 18,
        background: 'linear-gradient(225deg, transparent 50%, var(--oat) 50%)',
        borderLeft: '1.5px solid var(--umber-soft)',
        borderBottom: '1.5px solid var(--umber-soft)',
        borderRadius: '0 3px 0 0',
      }}/>
      {children}
    </div>
  );
}

interface UnderlineInputProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handwrittenLabel?: boolean;
  hint?: string;
  type?: string;
  name?: string;
  style?: React.CSSProperties;
}

export function UnderlineInput({ label, placeholder, value, onChange, handwrittenLabel, hint, type = 'text', name, style = {} }: UnderlineInputProps) {
  const [focus, setFocus] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }}>
      {handwrittenLabel ? (
        <span style={{
          fontFamily: 'var(--hand)',
          fontSize: 24,
          color: 'var(--umber)',
          marginLeft: -4,
          lineHeight: 1,
        }}>{label}</span>
      ) : (
        <span style={{
          fontSize: 12,
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.14em',
          color: 'var(--umber)',
        }}>{label}</span>
      )}
      <input
        type={type}
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          fontFamily: 'var(--serif)',
          fontSize: 22,
          color: 'var(--ink)',
          background: 'transparent',
          border: 'none',
          borderBottom: focus ? '2px solid var(--moss)' : '1.5px dashed var(--umber-soft)',
          padding: '8px 2px',
          outline: 'none',
          transition: 'border-color 200ms ease',
          letterSpacing: '-0.01em',
        }}
      />
      {hint && (
        <span style={{ fontSize: 12, color: 'var(--ink-soft)', opacity: 0.7, marginTop: 2 }}>{hint}</span>
      )}
    </div>
  );
}

interface UnderlineTextareaProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handwrittenLabel?: boolean;
  rows?: number;
  style?: React.CSSProperties;
}

export function UnderlineTextarea({ label, placeholder, value, onChange, handwrittenLabel, rows = 4, style = {} }: UnderlineTextareaProps) {
  const [focus, setFocus] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }}>
      {handwrittenLabel ? (
        <span style={{
          fontFamily: 'var(--hand)',
          fontSize: 28,
          color: 'var(--umber)',
          marginLeft: -4,
          lineHeight: 1,
        }}>{label}</span>
      ) : (
        <span style={{
          fontSize: 12,
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.14em',
          color: 'var(--umber)',
        }}>{label}</span>
      )}
      <textarea
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        rows={rows}
        style={{
          fontFamily: 'var(--serif)',
          fontSize: 18,
          color: 'var(--ink)',
          background: 'rgba(255,255,255,0.3)',
          borderTop: 'none',
          borderLeft: 'none',
          borderRight: 'none',
          borderBottom: focus ? '2px solid var(--moss)' : '1.5px dashed var(--umber-soft)',
          padding: '10px 6px',
          outline: 'none',
          transition: 'border-color 200ms ease',
          resize: 'vertical',
          lineHeight: 1.5,
        }}
      />
    </div>
  );
}

interface SprigDividerProps {
  color?: string;
}

export function SprigDivider({ color = 'var(--umber-soft)' }: SprigDividerProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '6px 0', color }}>
      <div style={{ flex: 1, height: 1, borderTop: `1.5px dashed ${color}`, opacity: 0.5 }}/>
      <Sprout size={18} color={color}/>
      <div style={{ flex: 1, height: 1, borderTop: `1.5px dashed ${color}`, opacity: 0.5 }}/>
    </div>
  );
}
