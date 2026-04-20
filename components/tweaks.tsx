'use client';

import React from 'react';
import { Sprout } from './icons';

export interface Tweaks {
  heroVariant: 'bold' | 'illustrated';
  tone: 'judgy' | 'warm';
  particleDensity: 'light' | 'normal' | 'heavy';
  primaryAccent: 'moss' | 'terracotta' | 'umber';
  paperTone: 'oat' | 'linen' | 'dusk';
  silly: boolean;
}

export const TWEAK_DEFAULTS: Tweaks = {
  heroVariant: 'bold',
  tone: 'judgy',
  particleDensity: 'normal',
  primaryAccent: 'moss',
  paperTone: 'oat',
  silly: true,
};

interface TweaksPanelProps {
  tweaks: Tweaks;
  onChange: (tweaks: Tweaks) => void;
  visible: boolean;
}

export function TweaksPanel({ tweaks, onChange, visible }: TweaksPanelProps) {
  if (!visible) return null;

  const set = <K extends keyof Tweaks>(k: K, v: Tweaks[K]) => onChange({ ...tweaks, [k]: v });

  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      right: 24,
      width: 300,
      background: 'var(--oat)',
      border: '1.5px solid var(--umber-soft)',
      borderRadius: '18px 6px 18px 6px',
      padding: '18px 20px 20px',
      boxShadow: '0 20px 60px -12px rgba(0,0,0,0.4)',
      fontFamily: 'var(--sans)',
      fontSize: 13,
      color: 'var(--ink)',
      zIndex: 1000,
      maxHeight: 'calc(100vh - 60px)',
      overflow: 'auto',
    }}>
      <div style={{
        position: 'absolute', top: -10, left: 30,
        width: 80, height: 20,
        background: 'rgba(228,169,75,0.6)',
        border: '1px dashed rgba(122,62,42,0.3)',
        transform: 'rotate(-3deg)',
      }}/>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, marginTop: 4 }}>
        <Sprout size={22}/>
        <h3 className="serif-display" style={{ margin: 0, fontSize: 22, fontWeight: 500 }}>Tweaks</h3>
      </div>

      <TweakRow label="Silly mode">
        <SegmentedControl
          value={tweaks.silly ? 'on' : 'off'}
          onChange={(v) => set('silly', v === 'on')}
          options={[{ v: 'off', l: 'Polite' }, { v: 'on', l: 'Unhinged' }]}
        />
      </TweakRow>

      <TweakRow label="Hero">
        <SegmentedControl
          value={tweaks.heroVariant}
          onChange={(v) => set('heroVariant', v as Tweaks['heroVariant'])}
          options={[{ v: 'bold', l: 'Bold type' }, { v: 'illustrated', l: 'With photo' }]}
        />
      </TweakRow>

      <TweakRow label="Voice">
        <SegmentedControl
          value={tweaks.tone}
          onChange={(v) => set('tone', v as Tweaks['tone'])}
          options={[{ v: 'judgy', l: 'Judgy' }, { v: 'warm', l: 'Warmer' }]}
        />
      </TweakRow>

      <TweakRow label="Confetti">
        <SegmentedControl
          value={tweaks.particleDensity}
          onChange={(v) => set('particleDensity', v as Tweaks['particleDensity'])}
          options={[
            { v: 'light', l: 'Sparse' },
            { v: 'normal', l: 'Normal' },
            { v: 'heavy', l: 'Overgrown' },
          ]}
        />
      </TweakRow>

      <TweakRow label="CTA color">
        <div style={{ display: 'flex', gap: 6 }}>
          {([
            { v: 'moss' as const, c: '#5a7d3a' },
            { v: 'terracotta' as const, c: '#c97b5e' },
            { v: 'umber' as const, c: '#7a3e2a' },
          ]).map(opt => (
            <button key={opt.v} onClick={() => set('primaryAccent', opt.v)}
              style={{
                width: 26, height: 26,
                borderRadius: '8px 3px 8px 3px',
                background: opt.c,
                border: tweaks.primaryAccent === opt.v ? '2px solid var(--umber)' : '1.5px solid rgba(122,62,42,0.3)',
                cursor: 'pointer',
                padding: 0,
              }}/>
          ))}
        </div>
      </TweakRow>

      <TweakRow label="Paper">
        <SegmentedControl
          value={tweaks.paperTone}
          onChange={(v) => set('paperTone', v as Tweaks['paperTone'])}
          options={[
            { v: 'oat', l: 'Oat' },
            { v: 'linen', l: 'Linen' },
            { v: 'dusk', l: 'Dusk' },
          ]}
        />
      </TweakRow>

      <div style={{ marginTop: 14, fontSize: 11, color: 'var(--ink-soft)', fontStyle: 'italic', opacity: 0.7 }}>
        Toggled via the toolbar. Changes persist.
      </div>
    </div>
  );
}

interface TweakRowProps {
  label: string;
  children: React.ReactNode;
}

function TweakRow({ label, children }: TweakRowProps) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{
        fontSize: 10, fontWeight: 600,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: 'var(--umber)', marginBottom: 6,
      }}>{label}</div>
      {children}
    </div>
  );
}

interface SegmentedOption {
  v: string;
  l: string;
}

interface SegmentedControlProps {
  value: string;
  onChange: (value: string) => void;
  options: SegmentedOption[];
}

function SegmentedControl({ value, onChange, options }: SegmentedControlProps) {
  return (
    <div style={{
      display: 'inline-flex',
      background: 'rgba(232,223,196,0.6)',
      border: '1px dashed var(--umber-soft)',
      borderRadius: '8px 3px 8px 3px',
      padding: 2,
      gap: 2,
    }}>
      {options.map(o => (
        <button key={o.v} onClick={() => onChange(o.v)}
          style={{
            padding: '5px 10px',
            fontSize: 12,
            background: value === o.v ? 'var(--moss)' : 'transparent',
            color: value === o.v ? 'var(--oat)' : 'var(--ink)',
            border: 'none',
            borderRadius: '6px 2px 6px 2px',
            cursor: 'pointer',
            fontFamily: 'var(--sans)',
            fontWeight: 500,
            transition: 'all 160ms ease',
          }}>{o.l}</button>
      ))}
    </div>
  );
}
