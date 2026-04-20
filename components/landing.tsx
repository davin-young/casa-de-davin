'use client';

import { useState } from 'react';
import { HouseGlyph, SunRating, SunRayBurst, LeafSprig, CouchGlyph, BedGlyph, ArrowRight, Sprout } from './icons';
import { PaperSurface, MossButton, SectionLabel, SprigDivider } from './shared';
import { WeatherChip, FlickerPrice, FeaturedIn, TrustAndSafety, AllYesFAQ, WaxSeal } from './silly';

type RoomId = 'couch' | 'bedroom';
type HeroVariant = 'bold' | 'illustrated';
type Tone = 'warm' | 'judgy';
type CornerStyle = 'a' | 'b';

interface LandingProps {
  onPickRoom: (roomId: RoomId) => void;
  heroVariant?: HeroVariant;
  tone?: Tone;
  silly?: boolean;
}

interface TopStripProps {
  silly: boolean;
}

interface HeroBoldProps {
  subtitle: string;
  silly: boolean;
}

interface HeroIllustratedProps {
  subtitle: string;
}

interface MetaPillProps {
  label: string;
  icon?: React.ReactNode;
}

interface RoomGridProps {
  onPickRoom: (roomId: RoomId) => void;
  tone: Tone;
  silly: boolean;
}

interface RoomCardProps {
  id: RoomId;
  name: string;
  subtitle: string;
  rating: number;
  ratingLabel: string;
  price: string;
  priceUnit: string;
  amenities: string[];
  asterisk?: string;
  glyph: React.ReactNode;
  glyphBg: string;
  cta: string;
  onPick: () => void;
  cornerStyle: CornerStyle;
  silly: boolean;
  lastReview?: string;
}

interface RoomBadgeProps {
  id: RoomId;
}

interface PlaceholderFrameProps {
  label: string;
  h?: number;
  hint?: string;
}

interface SillyRoomPhotoProps {
  id: RoomId;
}

interface HouseRulesProps {
  silly: boolean;
}

interface HostingStripProps {
  silly: boolean;
}

interface FooterProps {
  silly: boolean;
}

interface HouseRule {
  label: string;
  text: string;
}

interface RoomBadgeInfo {
  label: string;
  color: string;
}

export default function Landing({ onPickRoom, heroVariant = 'bold', tone = 'judgy', silly = false }: LandingProps) {
  const subtitle = tone === 'warm'
    ? 'Two rooms. One host. Surprisingly okay hospitality.'
    : 'Two rooms. One host. Questionable hospitality.';

  return (
    <PaperSurface style={{ minHeight: '100%', paddingBottom: 60 }}>
      {heroVariant === 'bold' ? <HeroBold subtitle={subtitle} silly={silly}/> : <HeroIllustrated subtitle={subtitle}/>}
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 40px', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 22 }}>
          <SectionLabel>The inventory</SectionLabel>
          <span className="hand" style={{ fontSize: 22, color: 'var(--umber-soft)' }}>pick your poison ↓</span>
        </div>
        <RoomGrid onPickRoom={onPickRoom} tone={tone} silly={silly}/>
        {silly && <FeaturedIn/>}
        {silly && <TrustAndSafety/>}
        <HouseRules silly={silly}/>
        {silly && <AllYesFAQ/>}
        <HostingStrip silly={silly}/>
        <Footer silly={silly}/>
      </div>
    </PaperSurface>
  );
}

function TopStrip({ silly }: TopStripProps) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '22px 40px 10px',
      maxWidth: 1120, margin: '0 auto',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <HouseGlyph size={26}/>
        <span className="serif-display" style={{ fontSize: 19, color: 'var(--ink)', fontWeight: 600 }}>
          Casa de Davin
        </span>
      </div>
      <div style={{ display: 'flex', gap: 24, alignItems: 'center', fontSize: 13, color: 'var(--ink-soft)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: 8, background: 'var(--moss)', boxShadow: '0 0 0 3px rgba(90,125,58,0.18)' }}/>
          Accepting guests
        </span>
        <span style={{ opacity: 0.7 }}>Denver·ish, CO</span>
        <span className="hand" style={{ fontSize: 20, color: 'var(--umber)', transform: 'rotate(-3deg)', display: 'inline-block' }}>
          est. whenever
        </span>
        {silly && <WeatherChip/>}
      </div>
    </div>
  );
}

function HeroBold({ subtitle, silly }: HeroBoldProps) {
  return (
    <div style={{ position: 'relative', maxWidth: 1120, margin: '0 auto', padding: '40px 40px 52px' }}>
      <div style={{ position: 'absolute', top: -60, right: 20, pointerEvents: 'none', animation: silly ? 'sun-rays 18s ease-in-out infinite' : 'none', zIndex: 0 }}>
        <SunRayBurst size={440} color="var(--honey)" opacity={0.28}/>
      </div>
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 40 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="hand" style={{ fontSize: 26, color: 'var(--umber)', marginBottom: 10, transform: 'rotate(-1.5deg)', display: 'inline-block' }}>
            welcome, traveler ·
          </div>
          <h1 style={{
            fontFamily: 'var(--serif)',
            fontVariationSettings: '"opsz" 144, "SOFT" 100',
            fontSize: 'clamp(52px, 8vw, 112px)',
            lineHeight: 0.94,
            letterSpacing: '-0.035em',
            margin: '0 0 22px',
            color: 'var(--ink)',
            fontWeight: 500,
            position: 'relative',
          }}>
            Casa de<br/>
            <span style={{ color: 'var(--umber)', fontStyle: 'italic', fontWeight: 400, display: 'inline-block', transform: silly ? 'rotate(-2.5deg)' : 'none' }}>Davin</span>
            <span style={{ color: 'var(--moss)', fontWeight: 400 }}>.</span>
          </h1>
          {silly && (
            <div style={{
              fontFamily: 'var(--hand)',
              fontSize: 22,
              color: 'var(--umber)',
              transform: 'rotate(-2deg)',
              display: 'inline-flex',
              alignItems: 'flex-start',
              gap: 8,
              marginBottom: 14,
              marginLeft: 120,
              marginTop: -18,
            }}>
              <svg width="48" height="52" viewBox="0 0 48 52" style={{ marginTop: -28, flexShrink: 0 }}>
                <path d="M44 48 Q 30 42 18 28 Q 10 18 6 6" stroke="var(--umber)" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
                <path d="M2 12 L6 6 L12 8" stroke="var(--umber)" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{ marginTop: 6 }}>yes that&apos;s a real name</span>
            </div>
          )}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 13, color: 'var(--ink-soft)', opacity: 0.8 }}>
            <MetaPill label="2 rooms" icon={<HouseGlyph size={14}/>}/>
            <MetaPill label="Plants (many, thriving)"/>
            <MetaPill label="Occasional pancakes"/>
            <MetaPill label="No corporate email"/>
          </div>
        </div>

        <div style={{ maxWidth: 340, textAlign: 'right', flexShrink: 0, alignSelf: 'center' }}>
          <p style={{
            fontFamily: 'var(--serif)',
            fontSize: 22,
            lineHeight: 1.4,
            color: 'var(--ink-soft)',
            margin: 0,
            fontStyle: 'italic',
            fontWeight: 400,
          }}>
            Two rooms. One host.{' '}
            {silly ? (
              <>
                <span style={{ textDecoration: 'line-through', textDecorationColor: 'var(--umber)', textDecorationThickness: 1.5, opacity: 0.55 }}>
                  Questionable hospitality.
                </span>{' '}
                <span className="hand" style={{ fontSize: 28, color: 'var(--umber)', fontStyle: 'normal', display: 'inline-block', transform: 'rotate(-1.5deg)', lineHeight: 1 }}>
                  hospitality-adjacent behaviors*
                </span>
              </>
            ) : (
              <>Questionable hospitality.</>
            )}
          </p>
          {silly && (
            <p style={{ fontSize: 13, fontStyle: 'italic', color: 'var(--ink-soft)', opacity: 0.7, fontFamily: 'var(--serif)', lineHeight: 1.5, marginTop: 14, marginBottom: 0 }}>
              *results may include: feeding you, judging you quietly, insisting on pancakes.
            </p>
          )}
          <p style={{
            fontFamily: 'var(--sans)',
            fontSize: 13,
            color: 'var(--ink-soft)',
            opacity: 0.7,
            margin: '18px 0 0',
            lineHeight: 1.5,
          }}>
            <span style={{ fontWeight: 500 }}>Denver-ish, CO</span>
            <br/>
            1900 Little Raven St, Denver, CO
          </p>
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 20, right: 40, transform: 'rotate(15deg)', opacity: 0.85 }}>
        <LeafSprig size={120} color="var(--moss)" rotation={-20}/>
      </div>
    </div>
  );
}

function HeroIllustrated({ subtitle }: HeroIllustratedProps) {
  return (
    <div style={{ position: 'relative', maxWidth: 1120, margin: '0 auto', padding: '40px 40px 52px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 40, alignItems: 'center' }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--serif)',
            fontSize: 72,
            lineHeight: 0.98,
            letterSpacing: '-0.03em',
            margin: '0 0 18px',
            color: 'var(--ink)',
            fontWeight: 500,
          }}>
            Casa de <span style={{ fontStyle: 'italic', color: 'var(--umber)' }}>Davin</span>
          </h1>
          <p style={{ fontFamily: 'var(--serif)', fontSize: 20, fontStyle: 'italic', color: 'var(--ink-soft)', margin: 0 }}>
            {subtitle}
          </p>
        </div>
        <PlaceholderFrame label="HOUSE PHOTO" h={260} hint="the porch or something"/>
      </div>
    </div>
  );
}

function MetaPill({ label, icon }: MetaPillProps) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '5px 11px',
      borderRadius: '12px 6px 12px 6px',
      background: 'rgba(232,223,196,0.55)',
      border: '1px solid rgba(122,62,42,0.2)',
      fontSize: 12,
      fontWeight: 500,
      color: 'var(--ink-soft)',
    }}>
      {icon}{label}
    </span>
  );
}

function RoomGrid({ onPickRoom, tone, silly }: RoomGridProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 32, marginBottom: 56 }}>
      <RoomCard
        id="couch"
        name="The Couch"
        subtitle={tone === 'warm' ? "It's a couch. A reliable one." : "It's a couch. You know what a couch is."}
        rating={3.1}
        ratingLabel="Horizontal surface confirmed"
        price="0"
        priceUnit="plea per night"
        amenities={['Blanket (one)', 'Cushions (three, varying firmness)', 'Proximity to snacks', 'TV within arm\'s reach']}
        glyph={<CouchGlyph size={120}/>}
        glyphBg="var(--terracotta)"
        cta="Claim the couch"
        onPick={() => onPickRoom('couch')}
        cornerStyle="a"
        silly={silly}
        lastReview="'Davin hums while cooking. Concerning but not disqualifying.' — Kevin"
      />
      <RoomCard
        id="bedroom"
        name="The Bedroom"
        subtitle="A real bed. In a real room. I know."
        rating={4.4}
        ratingLabel="Mostly photosynthesizing"
        price="0"
        priceUnit="plea per night"
        amenities={['Real mattress', 'Pillow (singular, emotionally supportive)', 'Door that locks (usually)', 'Window with view*']}
        asterisk="*View is of another window."
        glyph={<BedGlyph size={120}/>}
        glyphBg="var(--sage)"
        cta="Book the bedroom"
        onPick={() => onPickRoom('bedroom')}
        cornerStyle="b"
        silly={silly}
        lastReview="'Pillow really is emotionally supportive. I cried. Twice.' — Anon"
      />
    </div>
  );
}

function RoomCard({ id, name, subtitle, rating, ratingLabel, price, priceUnit, amenities, asterisk, glyph, glyphBg, cta, onPick, cornerStyle, silly, lastReview }: RoomCardProps) {
  const [hover, setHover] = useState(false);
  const radius = cornerStyle === 'a' ? 'var(--radius-card)' : 'var(--radius-card-alt)';

  return (
    <article
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative',
        background: 'var(--linen)',
        border: '1.5px solid var(--umber-soft)',
        borderRadius: radius,
        padding: '28px 28px 32px',
        transform: hover ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hover ? 'var(--shadow-lift)' : 'var(--shadow-soft)',
        transition: 'transform 400ms ease-out, box-shadow 400ms ease-out',
        overflow: 'hidden',
      }}
    >
      <div style={{
        position: 'absolute',
        top: cornerStyle === 'a' ? -6 : 'auto',
        bottom: cornerStyle === 'b' ? -6 : 'auto',
        right: -6,
        opacity: 0.5,
        transform: cornerStyle === 'b' ? 'rotate(180deg)' : 'none',
        pointerEvents: 'none',
      }}>
        <LeafSprig size={90} color="var(--moss)" rotation={cornerStyle === 'a' ? 45 : -30} opacity={0.5}/>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22, gap: 16 }}>
        <SillyRoomPhoto id={id}/>
        <RoomBadge id={id}/>
      </div>

      <h2 className="serif-display" style={{
        fontSize: 40,
        margin: '0 0 4px',
        color: 'var(--ink)',
        fontWeight: 500,
      }}>{name}</h2>

      <p style={{
        fontFamily: 'var(--serif)',
        fontStyle: 'italic',
        fontSize: 17,
        color: 'var(--ink-soft)',
        margin: '0 0 18px',
      }}>{subtitle}</p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <SunRating value={rating} size={16}/>
        <span style={{ fontSize: 14, color: 'var(--ink)', fontWeight: 500 }}>{rating}</span>
        <span style={{ fontSize: 13, color: 'var(--ink-soft)', fontStyle: 'italic' }}>· {ratingLabel}</span>
      </div>

      <SprigDivider/>

      <ul style={{
        listStyle: 'none',
        padding: 0,
        margin: '16px 0 14px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '10px 18px',
      }}>
        {amenities.map((a, i) => (
          <li key={i} style={{
            fontSize: 14,
            color: 'var(--ink)',
            display: 'flex',
            gap: 8,
            alignItems: 'flex-start',
            lineHeight: 1.4,
          }}>
            <span style={{ color: 'var(--moss)', marginTop: 4, flexShrink: 0 }}>
              <svg width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="3" fill="currentColor"/></svg>
            </span>
            {a}
          </li>
        ))}
      </ul>

      {asterisk && (
        <div style={{ fontSize: 11, color: 'var(--ink-soft)', fontStyle: 'italic', opacity: 0.75, marginBottom: 10 }}>
          {asterisk}
        </div>
      )}

      {silly && lastReview && (
        <div style={{
          margin: '8px 0 -6px',
          padding: '10px 12px',
          background: 'rgba(228,169,75,0.12)',
          border: '1px dashed var(--umber-soft)',
          borderRadius: '8px 14px 8px 14px',
          fontFamily: 'var(--serif)',
          fontStyle: 'italic',
          fontSize: 13,
          color: 'var(--ink-soft)',
          lineHeight: 1.4,
        }}>{lastReview}</div>
      )}

      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginTop: 22, paddingTop: 18,
        borderTop: '1px dashed var(--umber-soft)',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            {silly ? <FlickerPrice/> : (
              <span className="serif-display" style={{ fontSize: 30, color: 'var(--umber)', fontWeight: 600 }}>$0</span>
            )}
            <span style={{ fontSize: 13, color: 'var(--ink-soft)' }}>/ {priceUnit}</span>
          </div>
          <span className="hand" style={{ fontSize: 18, color: 'var(--umber-soft)' }}>
            {silly ? '(hover the price)' : '(bribes encouraged)'}
          </span>
        </div>
        <MossButton onClick={onPick} size="md">
          {cta} <ArrowRight size={16}/>
        </MossButton>
      </div>
    </article>
  );
}

function RoomBadge({ id }: RoomBadgeProps) {
  const map: Record<RoomId, RoomBadgeInfo> = {
    couch: { label: 'Most available', color: 'var(--terracotta)' },
    bedroom: { label: "Host's pick", color: 'var(--moss)' },
  };
  const b = map[id];
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '6px 12px',
      background: b.color,
      color: 'var(--oat)',
      borderRadius: '10px 4px 10px 4px',
      fontSize: 11,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.12em',
      transform: 'rotate(2deg)',
      boxShadow: '0 2px 6px -2px rgba(0,0,0,0.2)',
    }}>
      {b.label}
    </div>
  );
}

function PlaceholderFrame({ label, h = 200, hint = '' }: PlaceholderFrameProps) {
  return (
    <div style={{
      height: h,
      borderRadius: '18px 8px 18px 8px',
      background: 'repeating-linear-gradient(45deg, var(--linen) 0px, var(--linen) 10px, var(--linen-warm) 10px, var(--linen-warm) 20px)',
      border: '1.5px dashed var(--umber-soft)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      color: 'var(--umber)',
      fontFamily: 'var(--mono)',
      fontSize: 11,
      letterSpacing: '0.12em',
    }}>
      <div style={{ fontWeight: 500 }}>{label}</div>
      {hint && <div style={{ opacity: 0.6, fontStyle: 'italic' }}>· {hint} ·</div>}
    </div>
  );
}

function SillyRoomPhoto({ id }: SillyRoomPhotoProps) {
  const isCouch = id === 'couch';
  const tilt = isCouch ? -3 : 2.5;

  return (
    <div style={{
      position: 'relative',
      width: 220,
      flexShrink: 0,
    }}>
      <div style={{
        background: '#fdfaf0',
        border: '1.5px solid var(--umber-soft)',
        borderRadius: '4px 4px 4px 4px',
        padding: '8px 8px 30px',
        transform: `rotate(${tilt}deg)`,
        boxShadow: '0 10px 24px -10px rgba(43,53,36,0.35), 0 2px 6px -2px rgba(43,53,36,0.2)',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute',
          top: -10, left: '30%',
          width: 64, height: 18,
          background: 'rgba(228,169,75,0.6)',
          border: '1px dashed rgba(122,62,42,0.3)',
          transform: 'rotate(-6deg)',
        }}/>

        <div style={{
          position: 'relative',
          height: 150,
          borderRadius: 2,
          overflow: 'hidden',
          border: '1px solid rgba(122,62,42,0.25)',
        }}>
          <svg viewBox="0 0 220 150" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}>
            <defs>
              <radialGradient id={`light-${id}`} cx="0.78" cy="0.15" r="1.1">
                <stop offset="0%" stopColor={isCouch ? '#f4d58a' : '#f8e6b0'} stopOpacity="1"/>
                <stop offset="45%" stopColor={isCouch ? '#c8743f' : '#b89a6a'} stopOpacity="1"/>
                <stop offset="100%" stopColor={isCouch ? '#3a2418' : '#2a2418'} stopOpacity="1"/>
              </radialGradient>
              <linearGradient id={`floor-${id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#000" stopOpacity="0"/>
                <stop offset="100%" stopColor="#000" stopOpacity="0.45"/>
              </linearGradient>
              <linearGradient id={`subj-${id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isCouch ? '#6b3a24' : '#5a4838'} stopOpacity="1"/>
                <stop offset="100%" stopColor={isCouch ? '#2a1610' : '#1f1812'} stopOpacity="1"/>
              </linearGradient>
              <radialGradient id={`leak-${id}`} cx="0.05" cy="0.95" r="0.6">
                <stop offset="0%" stopColor="#ffb878" stopOpacity="0.55"/>
                <stop offset="100%" stopColor="#ffb878" stopOpacity="0"/>
              </radialGradient>
              <filter id={`grain-${id}`}>
                <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={isCouch ? 3 : 7}/>
                <feColorMatrix values="0 0 0 0 0.95  0 0 0 0 0.88  0 0 0 0 0.72  0 0 0 0.18 0"/>
              </filter>
            </defs>

            <rect width="220" height="150" fill={`url(#light-${id})`}/>
            <rect y="92" width="220" height="58" fill={`url(#floor-${id})`} opacity="0.7"/>

            {isCouch ? (
              <g>
                <rect x="158" y="8" width="46" height="34" fill="#fce9b8" opacity="0.55" rx="1"/>
                <line x1="181" y1="8" x2="181" y2="42" stroke="#7a3e2a" strokeWidth="1" opacity="0.4"/>
                <line x1="158" y1="25" x2="204" y2="25" stroke="#7a3e2a" strokeWidth="1" opacity="0.4"/>
                <ellipse cx="200" cy="118" rx="12" ry="6" fill="#000" opacity="0.3"/>
                <path d="M200 118 Q 192 95 188 82 M200 118 Q 208 100 212 88 M200 118 Q 200 92 202 78" stroke="#3d5a3a" strokeWidth="2" fill="none" strokeLinecap="round"/>
                <rect x="194" y="112" width="12" height="10" fill="#8a5a3c"/>
                <rect x="18" y="78" width="124" height="38" rx="6" fill={`url(#subj-${id})`}/>
                <rect x="22" y="72" width="116" height="14" rx="4" fill={`url(#subj-${id})`} opacity="0.85"/>
                <line x1="60" y1="80" x2="60" y2="112" stroke="#1a0e08" strokeWidth="1" opacity="0.6"/>
                <line x1="100" y1="80" x2="100" y2="112" stroke="#1a0e08" strokeWidth="1" opacity="0.6"/>
                <ellipse cx="38" cy="76" rx="14" ry="7" fill="#c97a48" opacity="0.85"/>
                <path d="M90 72 Q 105 68 128 78 L 132 95 Q 118 102 105 96 Z" fill="#d88a52" opacity="0.85"/>
                <ellipse cx="80" cy="120" rx="70" ry="4" fill="#000" opacity="0.4"/>
              </g>
            ) : (
              <g>
                <rect x="168" y="88" width="42" height="30" fill="#4a2e1c"/>
                <rect x="168" y="88" width="42" height="3" fill="#6b4228"/>
                <rect x="184" y="78" width="10" height="10" fill="#2a1a10"/>
                <polygon points="178,58 200,58 204,78 174,78" fill="#f4d58a"/>
                <polygon points="178,58 200,58 200,60 178,60" fill="#e8c070"/>
                <rect x="18" y="40" width="28" height="78" fill={`url(#subj-${id})`}/>
                <rect x="18" y="86" width="138" height="32" rx="3" fill="#e8d4a8"/>
                <rect x="18" y="82" width="138" height="10" rx="2" fill="#f2e0bc"/>
                <rect x="28" y="64" width="40" height="22" rx="4" fill="#f8ebc8"/>
                <rect x="32" y="68" width="34" height="16" rx="3" fill="#fff5de"/>
                <path d="M60 92 L 156 92 L 156 118 L 60 118 Z" fill="#a87454"/>
                <path d="M60 92 L 156 92 L 152 102 L 60 100 Z" fill="#c48a62"/>
                <ellipse cx="90" cy="122" rx="80" ry="3" fill="#000" opacity="0.4"/>
                <rect x="62" y="22" width="34" height="26" fill="#3a2418" stroke="#1a0e08" strokeWidth="1"/>
                <rect x="66" y="26" width="26" height="18" fill="#8a6a48"/>
              </g>
            )}

            <rect width="220" height="150" fill={`url(#leak-${id})`}/>
            <rect width="220" height="150" fill="url(#light-v)" opacity="0"/>
            <radialGradient id="light-v" cx="0.5" cy="0.5" r="0.75">
              <stop offset="60%" stopColor="#000" stopOpacity="0"/>
              <stop offset="100%" stopColor="#000" stopOpacity="0.5"/>
            </radialGradient>
            <rect width="220" height="150" fill="url(#light-v)"/>
            <rect width="220" height="150" filter={`url(#grain-${id})`} opacity="0.55"/>
          </svg>

          <div style={{
            position: 'absolute',
            top: 6, left: 6,
            fontFamily: 'var(--mono)',
            fontSize: 8,
            color: 'rgba(255,245,220,0.9)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            background: 'rgba(20,12,8,0.45)',
            padding: '2px 5px',
            borderRadius: 2,
            backdropFilter: 'blur(1px)',
          }}>
            img_00{isCouch ? '1' : '2'}.jpg
          </div>

          <div style={{
            position: 'absolute',
            bottom: 4, right: 6,
            fontFamily: 'var(--mono)',
            fontSize: 7,
            color: 'rgba(255,245,220,0.85)',
            letterSpacing: '0.08em',
            textAlign: 'right',
            lineHeight: 1.4,
            textShadow: '0 1px 2px rgba(0,0,0,0.6)',
          }}>
            f/2.8 · iphone · 1/40s<br/>
            ISO 800 · slightly blurry
          </div>

          {isCouch ? (
            <>
              <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} viewBox="0 0 220 150" preserveAspectRatio="none">
                <ellipse cx="80" cy="95" rx="66" ry="24" stroke="#fdfaf0" strokeWidth="1.8" fill="none" strokeDasharray="4 3" opacity="0.95"/>
                <path d="M168 68 Q 155 78 142 88" stroke="#fdfaf0" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                <path d="M150 82 L142 88 L145 96" stroke="#fdfaf0" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div style={{
                position: 'absolute',
                top: 52, right: 12,
                fontFamily: 'var(--hand)',
                fontSize: 19,
                color: '#fdfaf0',
                transform: 'rotate(4deg)',
                lineHeight: 1,
                textShadow: '0 1px 3px rgba(0,0,0,0.7)',
              }}>the couch</div>
              <div style={{
                position: 'absolute',
                bottom: 30, left: 10,
                fontFamily: 'var(--hand)',
                fontSize: 14,
                color: '#fdfaf0',
                transform: 'rotate(-3deg)',
                lineHeight: 1,
                textShadow: '0 1px 3px rgba(0,0,0,0.7)',
              }}>← snacks go here</div>
            </>
          ) : (
            <>
              <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} viewBox="0 0 220 150" preserveAspectRatio="none">
                <rect x="14" y="60" width="146" height="62" stroke="#fdfaf0" strokeWidth="1.8" fill="none" strokeDasharray="4 3" rx="4" opacity="0.95"/>
                <path d="M104 24 Q 100 38 92 58" stroke="#fdfaf0" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                <path d="M86 50 L92 58 L100 54" stroke="#fdfaf0" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div style={{
                position: 'absolute',
                top: 8, left: 76,
                fontFamily: 'var(--hand)',
                fontSize: 19,
                color: '#fdfaf0',
                transform: 'rotate(-3deg)',
                lineHeight: 1,
                textShadow: '0 1px 3px rgba(0,0,0,0.7)',
              }}>a real bed!</div>
              <div style={{
                position: 'absolute',
                bottom: 10, right: 8,
                fontFamily: 'var(--hand)',
                fontSize: 13,
                color: '#fdfaf0',
                transform: 'rotate(3deg)',
                lineHeight: 1.1,
                textAlign: 'right',
                textShadow: '0 1px 3px rgba(0,0,0,0.7)',
              }}>(door locks!<br/>usually)</div>
            </>
          )}
        </div>

        <div style={{
          position: 'absolute',
          bottom: 4, left: 0, right: 0,
          textAlign: 'center',
          fontFamily: 'var(--hand)',
          fontSize: 15,
          color: 'var(--umber)',
          lineHeight: 1,
        }}>
          {isCouch ? 'couch!! (allegedly)' : 'bedroom, 10/10, truly'}
        </div>
      </div>

      <div style={{
        position: 'absolute',
        top: 12, left: isCouch ? 30 : -16,
        width: 90,
        background: '#fdfaf0',
        border: '1.5px solid var(--umber-soft)',
        padding: '6px 6px 18px',
        transform: `rotate(${isCouch ? 8 : -9}deg)`,
        zIndex: -1,
        boxShadow: '0 6px 14px -6px rgba(43,53,36,0.4)',
      }}>
        <div style={{
          height: 56,
          borderRadius: 2,
          position: 'relative',
          overflow: 'hidden',
        }}>
          <svg viewBox="0 0 90 56" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}>
            <defs>
              <radialGradient id={`mini-${id}`} cx="0.7" cy="0.2" r="1">
                <stop offset="0%" stopColor={isCouch ? '#f4c878' : '#e8d4a8'}/>
                <stop offset="100%" stopColor={isCouch ? '#7a3e2a' : '#3a2a1c'}/>
              </radialGradient>
            </defs>
            <rect width="90" height="56" fill={`url(#mini-${id})`}/>
            {isCouch ? (
              <g>
                <path d="M0 38 Q 20 28 40 34 Q 60 40 90 30 L 90 56 L 0 56 Z" fill="#c97a48" opacity="0.9"/>
                <path d="M0 42 Q 18 36 38 40 Q 58 44 90 38" stroke="#8a4a28" strokeWidth="0.8" fill="none" opacity="0.7"/>
                <path d="M10 48 Q 30 44 50 47 Q 70 50 88 46" stroke="#8a4a28" strokeWidth="0.6" fill="none" opacity="0.5"/>
              </g>
            ) : (
              <g>
                <rect x="8" y="18" width="74" height="30" rx="6" fill="#f8ebc8"/>
                <rect x="12" y="22" width="66" height="22" rx="4" fill="#fff5de"/>
                <path d="M14 28 Q 40 32 76 28" stroke="#d8c098" strokeWidth="0.6" fill="none" opacity="0.7"/>
              </g>
            )}
          </svg>
          <div style={{
            position: 'absolute',
            bottom: 3, right: 4,
            fontFamily: 'var(--hand)',
            fontSize: 12,
            color: '#fdfaf0',
            transform: 'rotate(-2deg)',
            textShadow: '0 1px 2px rgba(0,0,0,0.6)',
          }}>
            {isCouch ? 'the blanket' : 'the pillow'}
          </div>
        </div>
        <div style={{
          position: 'absolute',
          bottom: 3, left: 0, right: 0,
          textAlign: 'center',
          fontFamily: 'var(--mono)',
          fontSize: 8,
          color: 'var(--umber)',
          letterSpacing: '0.08em',
        }}>
          {isCouch ? 'singular' : 'emotional'}
        </div>
      </div>

      <div style={{
        position: 'absolute',
        bottom: -8,
        right: isCouch ? 8 : 20,
        fontFamily: 'var(--hand)',
        fontSize: 14,
        color: 'var(--umber)',
        transform: `rotate(${isCouch ? 5 : -6}deg)`,
        background: 'rgba(242,234,216,0.9)',
        padding: '3px 8px',
        borderRadius: '8px 3px 8px 3px',
        border: '1px dashed var(--umber-soft)',
        whiteSpace: 'nowrap',
      }}>
        {isCouch ? '★★★☆☆ — "fine"' : '★★★★★ — (me)'}
      </div>
    </div>
  );
}

function HouseRules({ silly }: HouseRulesProps) {
  const rules: HouseRule[] = [
    { label: 'Plants', text: "Water them if you remember. Don't if you don't. They're tougher than me." },
    { label: 'Quiet', text: 'After 11pm, please whisper. Before 9am, forget I exist.' },
    { label: 'Kitchen', text: "Eat what's there. Label what you bring. Replace the oat milk." },
    { label: 'Wi-Fi', text: "Password is on the fridge. It's a pun. Sorry." },
  ];
  return (
    <section style={{
      background: 'var(--oat-deep)',
      border: '1px dashed var(--umber-soft)',
      borderRadius: '20px 8px 20px 8px',
      padding: '28px 32px',
      marginBottom: 36,
      position: 'relative',
    }}>
      {silly && <WaxSeal text="Inspected · approved" top={-18} right={30} rotate={10}/>}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 18 }}>
        <h3 className="serif-display" style={{ fontSize: 28, margin: 0, color: 'var(--ink)', fontWeight: 500 }}>
          House rules, loosely enforced
        </h3>
        <span className="hand" style={{ fontSize: 22, color: 'var(--umber-soft)' }}>(mostly vibes)</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 22 }}>
        {rules.map((r, i) => (
          <div key={i} style={{
            padding: '14px 16px',
            background: 'rgba(242,234,216,0.6)',
            borderRadius: '10px 14px 10px 14px',
            border: '1px solid rgba(122,62,42,0.15)',
          }}>
            <div style={{
              fontFamily: 'var(--sans)',
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--umber)',
              marginBottom: 6,
            }}>{r.label}</div>
            <div style={{ fontSize: 14, color: 'var(--ink)', lineHeight: 1.45 }}>{r.text}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function HostingStrip({ silly }: HostingStripProps) {
  return (
    <section style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 20,
      padding: '22px 26px',
      background: 'var(--linen)',
      border: '1.5px solid var(--umber-soft)',
      borderRadius: '16px 6px 16px 6px',
      marginBottom: 40,
      position: 'relative',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{
          width: 44, height: 44,
          borderRadius: '12px 4px 12px 4px',
          background: 'var(--moss)',
          color: 'var(--oat)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 600,
        }}>D</div>
        <div>
          <div style={{ fontSize: 13, color: 'var(--umber)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            Currently hosting
          </div>
          <div className="serif-display" style={{ fontSize: 22, color: 'var(--ink)', fontWeight: 500 }}>
            Nobody, actually. <span style={{ fontStyle: 'italic', color: 'var(--ink-soft)' }}>It&apos;s been three weeks.</span>
          </div>
        </div>
      </div>
      <span className="hand" style={{ fontSize: 24, color: 'var(--umber)', transform: 'rotate(-2deg)' }}>
        ← this could be you
      </span>
    </section>
  );
}

function Footer({ silly }: FooterProps) {
  return (
    <footer style={{
      textAlign: 'center',
      color: 'var(--ink-soft)',
      opacity: 0.7,
      fontSize: 13,
      paddingTop: 20,
      borderTop: '1px dashed var(--umber-soft)',
    }}>
      <div style={{ marginBottom: 6 }}>
        Built by Davin. Hosted by Davin. Judged by Davin.
      </div>
      <div className="hand" style={{ fontSize: 18 }}>
        made with coffee, not venture capital
      </div>
      {silly && (
        <div style={{ marginTop: 10, fontSize: 11, fontStyle: 'italic' }}>
          Davin&apos;s office hours: <span style={{ color: 'var(--moss)' }}>● napping</span> · last active 2m ago
        </div>
      )}
    </footer>
  );
}
