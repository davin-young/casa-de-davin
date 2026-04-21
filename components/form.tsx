'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, HouseGlyph, CouchGlyph, BedGlyph } from './icons';
import { PaperSurface, MossButton, SectionLabel, SprigDivider, UnderlineInput, UnderlineTextarea } from './shared';
import { PleaButton } from './silly';

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface Booking {
  room: 'couch' | 'bedroom';
  name: string;
  range: DateRange;
  why: string;
  travel: string;
  activities: string;
  email: string;
  ref?: string;
}

interface BookingFormProps {
  room: 'couch' | 'bedroom';
  onBack: () => void;
  onSubmit: (booking: Booking) => void;
  silly?: boolean;
}

interface SummaryRowProps {
  label: string;
  value: React.ReactNode;
}

export interface BlockedDate {
  start: string;
  end: string;
  room: 'couch' | 'bedroom' | null;
  type: 'booking' | 'blackout';
  label?: string;
}

interface GardenCalendarProps {
  range: DateRange;
  onChange: (range: DateRange) => void;
  blockedDates?: BlockedDate[];
}

interface DayCellProps {
  d: Date | null;
  today: Date;
  isStart: boolean;
  isEnd: boolean;
  inRange: boolean;
  blackout: boolean;
  onClick: () => void;
  seed: SeedKind | null;
}

export type SeedKind = 'leaf' | 'sprout' | 'sun' | 'dot' | 'x' | 'seed' | 'leaf-pair';

interface SeedGlyphProps {
  kind: SeedKind | null;
  color: string;
  size?: number;
}

interface LegendDotProps {
  color: string;
  label: string;
  border?: string;
}

interface RoomMeta {
  title: string;
  glyph: React.ReactNode;
  bg: string;
  note: string;
}

export default function BookingForm({ room, onBack, onSubmit, silly = false }: BookingFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [range, setRange] = useState<DateRange>({ start: null, end: null });
  const [why, setWhy] = useState('');
  const [travel, setTravel] = useState('');
  const [activities, setActivities] = useState('');
  const [dateWarning, setDateWarning] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);

  useEffect(() => {
    fetch(`/api/blocked-dates?room=${room}`)
      .then(r => r.json())
      .then((data: { ok: boolean; blocked?: BlockedDate[] }) => {
        if (data.ok && data.blocked) setBlockedDates(data.blocked);
      })
      .catch(() => {});
  }, [room]);

  const validate = (r: DateRange): string | null => {
    if (!r.start) return null;
    const minDate = new Date(2026, 5, 11);
    minDate.setHours(0, 0, 0, 0);
    if (r.start < minDate) return 'Booking opens June 11, 2026. Come back then.';
    if (r.end) {
      const nights = Math.round((r.end.getTime() - r.start.getTime()) / (1000 * 60 * 60 * 24));
      if (nights >= 21) return 'Three weeks is a lot. Are we… okay?';
      if (nights >= 10) return 'Ten-plus nights. Bold. I respect it.';
    }
    return null;
  };

  const handleRangeChange = (r: DateRange): void => {
    setRange(r);
    setDateWarning(validate(r));
  };

  const canSubmit = name.trim().length > 0 && range.start && range.end && why.trim().length > 0;

  const doSubmit = async (): Promise<void> => {
    if (!canSubmit || !range.start || !range.end) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          room,
          arrive: range.start.toISOString().split('T')[0],
          depart: range.end.toISOString().split('T')[0],
          why: why.trim(),
          travel: travel.trim(),
          activities: activities.trim(),
          email: email.trim() || undefined,
        }),
      });
      const data = await res.json() as { ok: boolean; ref?: string; error?: string };

      if (!res.ok || !data.ok) {
        setSubmitting(false);
        setDateWarning(data.error || 'Something went wrong. Try again?');
        return;
      }

      onSubmit({ room, name, range, why, travel, activities, email, ref: data.ref });
    } catch {
      setSubmitting(false);
      setDateWarning('Network error. Check your connection and try again.');
    }
  };

  const roomMetaMap: Record<'couch' | 'bedroom', RoomMeta> = {
    couch: { title: 'The Couch', glyph: <CouchGlyph size={56}/>, bg: 'var(--terracotta)', note: "It's a couch. You know what a couch is." },
    bedroom: { title: 'The Bedroom', glyph: <BedGlyph size={56}/>, bg: 'var(--sage)', note: 'A real bed. In a real room. I know.' },
  };
  const roomMeta = roomMetaMap[room];

  return (
    <PaperSurface style={{ minHeight: '100%', animation: 'fade-up 480ms ease-out', paddingBottom: 60 }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '22px 40px 10px',
        maxWidth: 1040, margin: '0 auto',
      }}>
        <button onClick={onBack} style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--umber)',
          fontFamily: 'var(--sans)',
          fontSize: 14,
          display: 'inline-flex', alignItems: 'center', gap: 6,
          cursor: 'pointer',
          padding: '6px 10px 6px 2px',
        }}>
          <ArrowLeft size={16}/> back to rooms
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <HouseGlyph size={22}/>
          <span className="serif-display" style={{ fontSize: 16, fontWeight: 600 }}>Casa de Davin</span>
        </div>
      </div>

      <div style={{ maxWidth: 1040, margin: '0 auto', padding: '16px 40px 40px', display: 'grid', gridTemplateColumns: '1fr 380px', gap: 48 }}>
        <div>
          <div style={{ marginBottom: 28 }}>
            <SectionLabel>Booking slip no. 0042</SectionLabel>
            <h1 className="serif-display" style={{
              fontSize: 56, lineHeight: 1.02, margin: '10px 0 10px',
              letterSpacing: '-0.02em',
            }}>
              Fill this out<br/>
              <span style={{ fontStyle: 'italic', color: 'var(--umber)' }}>like a seed packet.</span>
            </h1>
            <p style={{ fontFamily: 'var(--serif)', fontSize: 18, fontStyle: 'italic', color: 'var(--ink-soft)', margin: 0 }}>
              No account. No password. No &quot;verify your email.&quot; Just you, writing me a note.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <UnderlineInput
              label="Who's asking?"
              placeholder="e.g. your name, or an alias you'll regret"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            />

            <UnderlineInput
              label="Email (optional)"
              placeholder="you@wherever.com"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              hint="Only so I can let you know if you're in. I won't spam you. I barely email people I like."
            />

            <div>
              <div style={{
                fontSize: 12,
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                color: 'var(--umber)',
                marginBottom: 10,
              }}>
                When are you inflicting yourself on me?
              </div>
              <GardenCalendar range={range} onChange={handleRangeChange} blockedDates={blockedDates}/>
              {dateWarning && (
                <div style={{
                  marginTop: 12,
                  padding: '10px 14px',
                  background: 'rgba(228,169,75,0.2)',
                  border: '1px dashed var(--umber-soft)',
                  borderRadius: '8px 14px 8px 14px',
                  fontFamily: 'var(--serif)',
                  fontSize: 15,
                  fontStyle: 'italic',
                  color: 'var(--umber)',
                }}>
                  {dateWarning}
                </div>
              )}
            </div>

            <UnderlineTextarea
              label="why should I let you stay?"
              handwrittenLabel
              placeholder="Bribes accepted in the form of good gossip, a weirdly specific compliment, or a story about someone we both know. Cash also fine but less charming."
              value={why}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setWhy(e.target.value)}
              rows={4}
            />

            <UnderlineInput
              label="How will you get here?"
              placeholder="Flight, drive, questionable rideshare, teleportation…"
              value={travel}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTravel(e.target.value)}
              hint="Optional. I ask because I'm nosy, not because I'll pick you up."
            />

            <UnderlineInput
              label="What would you like to do?"
              placeholder="Hike, eat tacos, day-drink responsibly, exist on the couch…"
              value={activities}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setActivities(e.target.value)}
              hint="Optional. Helps me pretend I'm a good host."
            />
          </div>

          <div style={{ marginTop: 42, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 18 }}>
            <div style={{ maxWidth: 380, fontSize: 12, color: 'var(--ink-soft)', lineHeight: 1.5, fontStyle: 'italic' }}>
              Submitting this adds it to my calendar and sends me an email. That&apos;s it. No spam, no newsletter, no &quot;confirm your email&quot; nonsense. I&apos;ll just see it and reply.
            </div>
            <PleaButton onClick={doSubmit} disabled={!canSubmit || submitting} silly={silly} size="lg">
              {submitting ? (
                <>
                  <SpinnerDot/> Consulting the house spirits…
                </>
              ) : (
                <>Send my plea <ArrowRight size={16}/></>
              )}
            </PleaButton>
          </div>
        </div>

        <aside style={{ position: 'sticky', top: 20, alignSelf: 'flex-start' }}>
          <div style={{
            background: 'var(--linen)',
            border: '1.5px solid var(--umber-soft)',
            borderRadius: '20px 6px 20px 6px',
            padding: '24px 24px 26px',
            boxShadow: 'var(--shadow-soft)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: -10, left: 24,
              width: 70, height: 22,
              background: 'rgba(228,169,75,0.6)',
              border: '1px dashed rgba(122,62,42,0.3)',
              transform: 'rotate(-3deg)',
            }}/>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18, marginTop: 6 }}>
              <div style={{
                width: 70, height: 60,
                background: roomMeta.bg,
                borderRadius: '12px 6px 12px 6px',
                border: '1.5px solid var(--umber-soft)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'repeating-linear-gradient(135deg, rgba(255,255,255,0.12) 0px, rgba(255,255,255,0.12) 1px, transparent 1px, transparent 6px)',
                }}/>
                {roomMeta.glyph}
              </div>
              <div>
                <div className="serif-display" style={{ fontSize: 24, fontWeight: 500 }}>{roomMeta.title}</div>
                <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--ink-soft)' }}>
                  {roomMeta.note}
                </div>
              </div>
            </div>

            <SprigDivider/>

            <SummaryRow label="Guest" value={name || <em style={{ opacity: 0.5 }}>(pending)</em>}/>
            <SummaryRow label="Arrives" value={range.start ? fmtDate(range.start) : <em style={{ opacity: 0.5 }}>(pick a date)</em>}/>
            <SummaryRow label="Departs" value={range.end ? fmtDate(range.end) : <em style={{ opacity: 0.5 }}>(pick a date)</em>}/>
            <SummaryRow label="Nights" value={range.start && range.end ? Math.round((range.end.getTime() - range.start.getTime()) / 86400000) : '—'}/>

            <SprigDivider/>

            <div style={{
              marginTop: 14,
              padding: 12,
              background: 'rgba(242,234,216,0.5)',
              borderRadius: '6px 10px 6px 10px',
              border: '1px dashed var(--umber-soft)',
            }}>
              <div className="hand" style={{ fontSize: 20, color: 'var(--umber)', marginBottom: 4 }}>
                total damage
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <span className="serif-display" style={{ fontSize: 34, color: 'var(--umber)', fontWeight: 600 }}>
                  $0
                </span>
                <span style={{ fontSize: 13, color: 'var(--ink-soft)', fontStyle: 'italic' }}>
                  + social debt
                </span>
              </div>
            </div>

            <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--ink-soft)' }}>
              <span style={{ width: 8, height: 8, borderRadius: 8, background: 'var(--moss)' }}/>
              The fiddle-leaf fig will judge silently.
            </div>
          </div>
        </aside>
      </div>
    </PaperSurface>
  );
}

function SummaryRow({ label, value }: SummaryRowProps) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '8px 0', fontSize: 14 }}>
      <span style={{
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: '0.14em',
        color: 'var(--umber)',
        fontWeight: 500,
      }}>{label}</span>
      <span style={{ color: 'var(--ink)', fontFamily: 'var(--serif)', fontSize: 16, textAlign: 'right' }}>
        {value}
      </span>
    </div>
  );
}

function SpinnerDot() {
  return (
    <span style={{
      display: 'inline-block',
      width: 10, height: 10,
      borderRadius: 10,
      background: 'currentColor',
      animation: 'gentle-sway 900ms ease-in-out infinite',
      marginRight: 4,
    }}/>
  );
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' });
}

function GardenCalendar({ range, onChange, blockedDates = [] }: GardenCalendarProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const minDate = new Date(2026, 5, 11);
  minDate.setHours(0, 0, 0, 0);
  const earliest = today > minDate ? today : minDate;

  const isBlackout = (d: Date): boolean => {
    const iso = d.toISOString().split('T')[0];
    return blockedDates.some(b => iso >= b.start && iso <= b.end);
  };
  const isBookedBlackout = (d: Date): boolean => {
    const iso = d.toISOString().split('T')[0];
    return blockedDates.some(b => b.type === 'booking' && iso >= b.start && iso <= b.end);
  };

  const [monthCursor, setMonthCursor] = useState<Date>(() => new Date(earliest.getFullYear(), earliest.getMonth(), 1));

  const monthName = monthCursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const firstOfMonth = new Date(monthCursor);
  const lastOfMonth = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 0);
  const startOffset = firstOfMonth.getDay();

  const days: (Date | null)[] = [];
  for (let i = 0; i < startOffset; i++) days.push(null);
  for (let d = 1; d <= lastOfMonth.getDate(); d++) {
    days.push(new Date(monthCursor.getFullYear(), monthCursor.getMonth(), d));
  }

  const inRange = (d: Date): boolean => {
    if (!range.start || !range.end) return false;
    return d >= range.start && d <= range.end;
  };
  const isEdgeFn = (d: Date, which: 'start' | 'end'): boolean => {
    if (which === 'start') return !!range.start && sameDay(d, range.start);
    return !!range.end && sameDay(d, range.end);
  };

  const handleClick = (d: Date): void => {
    if (d < earliest) return;
    if (isBlackout(d)) return;
    if (!range.start || (range.start && range.end)) {
      onChange({ start: d, end: null });
    } else if (d < range.start) {
      onChange({ start: d, end: range.start });
    } else if (sameDay(d, range.start)) {
      onChange({ start: d, end: d });
    } else {
      onChange({ start: range.start, end: d });
    }
  };

  const seedFor = (d: Date | null): SeedKind | null => {
    if (!d) return null;
    const dow = d.getDay();
    const dom = d.getDate();
    const kinds: SeedKind[] = ['leaf', 'sprout', 'sun', 'dot', 'x', 'seed', 'leaf-pair'];
    return kinds[(dow + dom) % kinds.length];
  };

  return (
    <div style={{
      background: 'rgba(232,223,196,0.4)',
      border: '1.5px solid var(--umber-soft)',
      borderRadius: '16px 6px 16px 6px',
      padding: '16px 18px 20px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <button onClick={() => setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() - 1, 1))}
          style={navBtn}>
          <ArrowLeft size={16}/>
        </button>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <h3 className="serif-display" style={{ fontSize: 22, margin: 0, fontWeight: 500 }}>{monthName}</h3>
          <span className="hand" style={{ fontSize: 18, color: 'var(--umber-soft)' }}>the garden plot</span>
        </div>
        <button onClick={() => setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1))}
          style={navBtn}>
          <ArrowRight size={16}/>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 6 }}>
        {['S','M','T','W','T','F','S'].map((d, i) => (
          <div key={i} style={{
            textAlign: 'center', fontSize: 10, fontWeight: 600, letterSpacing: '0.16em',
            color: 'var(--umber)', opacity: 0.6,
          }}>{d}</div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
        {days.map((d, i) => (
          <DayCell
            key={i}
            d={d}
            today={earliest}
            isStart={!!d && isEdgeFn(d, 'start')}
            isEnd={!!d && isEdgeFn(d, 'end')}
            inRange={!!d && inRange(d)}
            blackout={!!d && isBlackout(d)}
            onClick={() => d && handleClick(d)}
            seed={seedFor(d)}
          />
        ))}
      </div>

      <div style={{ display: 'flex', gap: 14, marginTop: 14, fontSize: 11, color: 'var(--ink-soft)', flexWrap: 'wrap' }}>
        <LegendDot color="var(--moss)" label="arrive / depart"/>
        <LegendDot color="var(--honey)" label="staying"/>
        <LegendDot color="transparent" border="var(--umber-soft)" label="empty plot"/>
        <LegendDot color="repeating-linear-gradient(45deg, rgba(168,94,68,0.4) 0 4px, transparent 4px 8px)" border="var(--terracotta-deep)" label="already taken"/>
        <span style={{ fontStyle: 'italic', opacity: 0.85, marginLeft: 'auto', fontFamily: 'var(--serif)' }}>
          opens June 11, 2026 · nothing sooner, sorry
        </span>
      </div>
    </div>
  );
}

function DayCell({ d, today, isStart, isEnd, inRange, blackout, onClick, seed }: DayCellProps) {
  const [hover, setHover] = useState(false);
  if (!d) return <div style={{ aspectRatio: '1 / 1.05' }}/>;

  const isPast = d < today;
  const isEdge = isStart || isEnd;
  const disabled = isPast || blackout;
  const bg = isEdge
    ? 'var(--moss)'
    : inRange
      ? 'var(--honey)'
      : blackout
        ? 'repeating-linear-gradient(45deg, rgba(168,94,68,0.35) 0 4px, rgba(242,234,216,0.3) 4px 8px)'
        : hover && !disabled
          ? 'rgba(228,169,75,0.3)'
          : 'rgba(242,234,216,0.5)';
  const color = isEdge ? 'var(--oat)' : disabled ? 'var(--ink-soft)' : 'var(--ink)';
  const border = isEdge
    ? '1.5px solid var(--moss-dark)'
    : blackout
      ? '1px solid var(--terracotta-deep)'
      : '1px dashed var(--umber-soft)';

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      disabled={disabled}
      title={blackout ? 'already taken' : ''}
      style={{
        aspectRatio: '1 / 1.05',
        background: bg,
        border,
        borderRadius: '8px 3px 8px 3px',
        padding: '4px 4px 2px',
        display: 'flex', flexDirection: 'column',
        alignItems: 'flex-start', justifyContent: 'space-between',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: isPast ? 0.4 : blackout ? 0.65 : 1,
        position: 'relative',
        transition: 'background 140ms ease, transform 140ms ease',
        transform: hover && !disabled ? 'translateY(-1px)' : 'none',
        color,
      }}
    >
      <span style={{
        fontFamily: 'var(--serif)',
        fontSize: 13,
        fontWeight: isEdge ? 600 : 500,
        textDecoration: blackout ? 'line-through' : 'none',
      }}>{d.getDate()}</span>
      <span style={{ alignSelf: 'center', marginBottom: 2, opacity: 0.75 }}>
        <SeedGlyph kind={seed} color={isEdge ? 'var(--oat)' : 'var(--umber)'} size={14}/>
      </span>
    </button>
  );
}

export function SeedGlyph({ kind, color, size = 14 }: SeedGlyphProps): React.ReactNode {
  switch (kind) {
    case 'leaf':
      return <svg width={size} height={size} viewBox="0 0 14 14"><ellipse cx="7" cy="7" rx="5" ry="2.2" transform="rotate(-35 7 7)" fill={color} opacity="0.6"/></svg>;
    case 'sprout':
      return <svg width={size} height={size} viewBox="0 0 14 14"><path d="M7 12 L7 7" stroke={color} strokeWidth="1"/><ellipse cx="5" cy="6" rx="2.2" ry="1.1" transform="rotate(-25 5 6)" fill={color} opacity="0.6"/><ellipse cx="9" cy="6" rx="2.2" ry="1.1" transform="rotate(25 9 6)" fill={color} opacity="0.6"/></svg>;
    case 'sun':
      return <svg width={size} height={size} viewBox="0 0 14 14"><circle cx="7" cy="7" r="2.2" fill={color} opacity="0.7"/><g stroke={color} strokeWidth="0.9" opacity="0.6"><line x1="7" y1="2" x2="7" y2="3.5"/><line x1="7" y1="10.5" x2="7" y2="12"/><line x1="2" y1="7" x2="3.5" y2="7"/><line x1="10.5" y1="7" x2="12" y2="7"/></g></svg>;
    case 'dot':
      return <svg width={size} height={size} viewBox="0 0 14 14"><circle cx="7" cy="7" r="1.6" fill={color} opacity="0.6"/></svg>;
    case 'x':
      return <svg width={size} height={size} viewBox="0 0 14 14"><g stroke={color} strokeWidth="0.9" opacity="0.5"><line x1="4" y1="4" x2="10" y2="10"/><line x1="10" y1="4" x2="4" y2="10"/></g></svg>;
    case 'seed':
      return <svg width={size} height={size} viewBox="0 0 14 14"><ellipse cx="7" cy="7" rx="2.2" ry="3.2" fill={color} opacity="0.55"/></svg>;
    case 'leaf-pair':
      return <svg width={size} height={size} viewBox="0 0 14 14"><ellipse cx="5" cy="8" rx="2.2" ry="1" transform="rotate(-30 5 8)" fill={color} opacity="0.55"/><ellipse cx="9" cy="6" rx="2.2" ry="1" transform="rotate(30 9 6)" fill={color} opacity="0.55"/></svg>;
    default: return null;
  }
}

function LegendDot({ color, label, border }: LegendDotProps) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{
        width: 12, height: 12, borderRadius: 3,
        background: color,
        border: border ? `1px dashed ${border}` : 'none',
      }}/>
      {label}
    </span>
  );
}

const navBtn: React.CSSProperties = {
  width: 32, height: 32,
  borderRadius: '10px 4px 10px 4px',
  background: 'transparent',
  border: '1px dashed var(--umber-soft)',
  color: 'var(--umber)',
  display: 'inline-flex',
  alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer',
};

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
