'use client';

import { useState, useMemo, CSSProperties } from 'react';
import { ArrowLeft, ArrowRight, CouchGlyph, BedGlyph } from './icons';
import { SectionLabel, MossButton } from './shared';

type BookingStatus = 'pending' | 'approved' | 'declined';

interface BookingRecord {
  id: string;
  ref: string;
  name: string;
  room: string;
  arrive: string;
  depart: string;
  status: BookingStatus;
  why: string;
  travel: string;
  email: string | null;
  notes: string | null;
  calendarEventId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface BlackoutRecord {
  id: string;
  startDate: string;
  endDate: string;
  label: string;
  room: 'couch' | 'bedroom' | null;
}

interface AdminCalendarProps {
  bookings: BookingRecord[];
  blackouts: BlackoutRecord[];
  onSelectBooking: (booking: BookingRecord) => void;
  onDeleteBlackout?: (id: string) => void;
}

interface BarData {
  type: 'booking' | 'blackout';
  id: string;
  label: string;
  start: string;
  end: string;
  room: 'couch' | 'bedroom' | null;
  status?: BookingStatus;
  booking?: BookingRecord;
}

export default function AdminCalendar({ bookings, blackouts, onSelectBooking, onDeleteBlackout }: AdminCalendarProps) {
  const [monthOffset, setMonthOffset] = useState(0);
  const [monthCount, setMonthCount] = useState<1 | 2 | 3>(1);
  const [showDeclined, setShowDeclined] = useState(false);
  const [tooltip, setTooltip] = useState<{ bar: BarData; x: number; y: number } | null>(null);

  const baseMonth = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  }, [monthOffset]);

  const months = useMemo(() => {
    return Array.from({ length: monthCount }, (_, i) =>
      new Date(baseMonth.getFullYear(), baseMonth.getMonth() + i, 1)
    );
  }, [baseMonth, monthCount]);

  const filteredBookings = bookings.filter(b => {
    if (b.status === 'declined' && !showDeclined) return false;
    return true;
  });

  return (
    <section style={{
      padding: '24px 26px',
      background: 'var(--linen)',
      border: '1.5px solid var(--umber-soft)',
      borderRadius: '16px 6px 16px 6px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <SectionLabel>Calendar overview</SectionLabel>
          <div style={{ fontSize: 13, color: 'var(--ink-soft)', fontStyle: 'italic', fontFamily: 'var(--serif)', marginTop: 2 }}>
            All bookings and blackouts at a glance.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={() => setMonthOffset(m => m - 1)} style={navBtnStyle}><ArrowLeft size={14} /></button>
          <button onClick={() => setMonthOffset(0)} style={{
            ...navBtnStyle,
            fontSize: 11,
            fontFamily: 'var(--sans)',
            padding: '6px 12px',
          }}>Today</button>
          <button onClick={() => setMonthOffset(m => m + 1)} style={navBtnStyle}><ArrowRight size={14} /></button>
          <span style={{ width: 1, height: 20, background: 'var(--umber-soft)', margin: '0 4px' }} />
          {([1, 2, 3] as const).map(n => (
            <button key={n} onClick={() => setMonthCount(n)} style={{
              ...navBtnStyle,
              background: monthCount === n ? 'var(--moss)' : 'transparent',
              color: monthCount === n ? 'var(--oat)' : 'var(--umber)',
              borderColor: monthCount === n ? 'var(--moss-dark)' : 'var(--umber-soft)',
              fontSize: 11,
              padding: '6px 10px',
            }}>{n}mo</button>
          ))}
          <span style={{ width: 1, height: 20, background: 'var(--umber-soft)', margin: '0 4px' }} />
          <button onClick={() => setShowDeclined(!showDeclined)} style={{
            ...navBtnStyle,
            background: showDeclined ? 'rgba(201,123,94,0.15)' : 'transparent',
            fontSize: 11,
            padding: '6px 10px',
          }}>
            {showDeclined ? 'Hide' : 'Show'} declined
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${monthCount}, 1fr)`, gap: 24 }}>
        {months.map((month, mi) => (
          <MonthView
            key={`${month.getFullYear()}-${month.getMonth()}`}
            month={month}
            bookings={filteredBookings}
            blackouts={blackouts}
            onSelectBooking={onSelectBooking}
            onDeleteBlackout={onDeleteBlackout}
            onHover={(bar, x, y) => setTooltip(bar ? { bar, x, y } : null)}
          />
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginTop: 16, fontSize: 11, color: 'var(--ink-soft)', flexWrap: 'wrap' }}>
        <LegendItem color="var(--moss)" label="Bedroom (approved)" />
        <LegendItem color="var(--honey)" label="Couch (approved)" />
        <LegendItem color="var(--moss)" opacity={0.4} dashed label="Pending" />
        {showDeclined && <LegendItem color="var(--terracotta)" opacity={0.35} label="Declined" />}
        <LegendItem color="var(--ink-soft)" opacity={0.3} hatched label="Blackout" />
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div style={{
          position: 'fixed',
          left: tooltip.x + 12,
          top: tooltip.y - 10,
          background: 'var(--linen)',
          border: '1.5px solid var(--umber-soft)',
          borderRadius: '8px 3px 8px 3px',
          padding: '8px 12px',
          fontSize: 12,
          color: 'var(--ink)',
          boxShadow: '0 4px 12px -4px rgba(0,0,0,0.2)',
          zIndex: 100,
          pointerEvents: 'none',
          maxWidth: 220,
        }}>
          <div style={{ fontWeight: 600 }}>{tooltip.bar.label}</div>
          <div style={{ color: 'var(--ink-soft)', marginTop: 2 }}>
            {tooltip.bar.start} → {tooltip.bar.end}
          </div>
          {tooltip.bar.room && <div style={{ color: 'var(--ink-soft)' }}>{tooltip.bar.room}</div>}
          {tooltip.bar.status && <div style={{ color: 'var(--ink-soft)', textTransform: 'capitalize' }}>{tooltip.bar.status}</div>}
        </div>
      )}
    </section>
  );
}

interface MonthViewProps {
  month: Date;
  bookings: BookingRecord[];
  blackouts: BlackoutRecord[];
  onSelectBooking: (booking: BookingRecord) => void;
  onDeleteBlackout?: (id: string) => void;
  onHover: (bar: BarData | null, x: number, y: number) => void;
}

function MonthView({ month, bookings, blackouts, onSelectBooking, onDeleteBlackout, onHover }: MonthViewProps) {
  const monthName = month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const daysInMonth = lastDay.getDate();

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const monthStart = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}-01`;
  const monthEnd = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;

  // Filter to bookings/blackouts that overlap this month
  const monthBookings = bookings.filter(b => b.arrive <= monthEnd && b.depart >= monthStart);
  const monthBlackouts = blackouts.filter(bl => bl.startDate <= monthEnd && bl.endDate >= monthStart);

  const rooms: ('bedroom' | 'couch')[] = ['bedroom', 'couch'];

  return (
    <div>
      <h3 className="serif-display" style={{ fontSize: 18, fontWeight: 500, margin: '0 0 12px', textAlign: 'center' }}>
        {monthName}
      </h3>

      {rooms.map(rm => (
        <div key={rm} style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            {rm === 'couch' ? <CouchGlyph size={16} /> : <BedGlyph size={16} />}
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--umber)' }}>
              {rm}
            </span>
          </div>
          <div style={{
            position: 'relative',
            height: 28,
            background: 'rgba(242,234,216,0.5)',
            border: '1px dashed var(--umber-soft)',
            borderRadius: '6px 2px 6px 2px',
            overflow: 'hidden',
          }}>
            {/* Today marker */}
            {todayStr >= monthStart && todayStr <= monthEnd && (
              <div style={{
                position: 'absolute',
                left: `${((parseInt(todayStr.split('-')[2]) - 1) / daysInMonth) * 100}%`,
                top: 0,
                bottom: 0,
                width: 2,
                background: 'var(--terracotta)',
                opacity: 0.5,
                zIndex: 2,
              }} />
            )}

            {/* Blackout bars for this room */}
            {monthBlackouts
              .filter(bl => !bl.room || bl.room === rm)
              .map(bl => {
                const { left, width } = barPosition(bl.startDate, bl.endDate, monthStart, daysInMonth);
                return (
                  <div
                    key={`bl-${bl.id}`}
                    style={{
                      position: 'absolute',
                      left: `${left}%`,
                      width: `${width}%`,
                      top: 2,
                      bottom: 2,
                      background: 'repeating-linear-gradient(45deg, rgba(107,122,94,0.2) 0 3px, transparent 3px 6px)',
                      borderRadius: '4px 2px 4px 2px',
                      border: '1px solid rgba(107,122,94,0.3)',
                      cursor: onDeleteBlackout ? 'pointer' : 'default',
                      display: 'flex',
                      alignItems: 'center',
                      paddingLeft: 4,
                      overflow: 'hidden',
                    }}
                    onClick={() => onDeleteBlackout?.(bl.id)}
                    onMouseEnter={(e) => onHover({
                      type: 'blackout', id: bl.id, label: bl.label,
                      start: bl.startDate, end: bl.endDate, room: bl.room,
                    }, e.clientX, e.clientY)}
                    onMouseLeave={() => onHover(null, 0, 0)}
                  >
                    <span style={{ fontSize: 9, color: 'var(--ink-soft)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {bl.label}
                    </span>
                  </div>
                );
              })}

            {/* Booking bars for this room */}
            {monthBookings
              .filter(b => b.room === rm)
              .map(b => {
                const { left, width } = barPosition(b.arrive, b.depart, monthStart, daysInMonth);
                const barColor = rm === 'bedroom' ? 'var(--moss)' : 'var(--honey)';
                const isApproved = b.status === 'approved';
                const isPending = b.status === 'pending';
                const isDeclined = b.status === 'declined';

                return (
                  <div
                    key={`bk-${b.id}`}
                    style={{
                      position: 'absolute',
                      left: `${left}%`,
                      width: `${width}%`,
                      top: 2,
                      bottom: 2,
                      background: barColor,
                      opacity: isDeclined ? 0.35 : isPending ? 0.55 : 0.85,
                      borderRadius: '4px 2px 4px 2px',
                      border: isPending ? `1.5px dashed ${barColor}` : 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      paddingLeft: 4,
                      overflow: 'hidden',
                      textDecoration: isDeclined ? 'line-through' : 'none',
                    }}
                    onClick={() => onSelectBooking(b)}
                    onMouseEnter={(e) => onHover({
                      type: 'booking', id: b.id, label: b.name,
                      start: b.arrive, end: b.depart, room: b.room as 'couch' | 'bedroom',
                      status: b.status, booking: b,
                    }, e.clientX, e.clientY)}
                    onMouseLeave={() => onHover(null, 0, 0)}
                  >
                    <span style={{
                      fontSize: 9,
                      fontWeight: 600,
                      color: isApproved ? 'var(--oat)' : 'var(--ink)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {b.name}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      ))}

      {/* Day numbers */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'var(--ink-soft)', opacity: 0.7, marginTop: 2 }}>
        <span>1</span>
        <span>{Math.floor(daysInMonth / 2)}</span>
        <span>{daysInMonth}</span>
      </div>
    </div>
  );
}

function barPosition(start: string, end: string, monthStart: string, daysInMonth: number) {
  const monthStartDate = new Date(monthStart);
  const startDate = new Date(start);
  const endDate = new Date(end);

  const startDay = Math.max(0, Math.floor((startDate.getTime() - monthStartDate.getTime()) / 86_400_000));
  const endDay = Math.min(daysInMonth, Math.ceil((endDate.getTime() - monthStartDate.getTime()) / 86_400_000));

  const left = (startDay / daysInMonth) * 100;
  const width = Math.max(2, ((endDay - startDay) / daysInMonth) * 100);

  return { left, width };
}

function LegendItem({ color, label, opacity = 1, dashed = false, hatched = false }: {
  color: string;
  label: string;
  opacity?: number;
  dashed?: boolean;
  hatched?: boolean;
}) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{
        width: 16, height: 10, borderRadius: 2,
        background: hatched
          ? `repeating-linear-gradient(45deg, ${color} 0 2px, transparent 2px 4px)`
          : color,
        opacity,
        border: dashed ? `1.5px dashed ${color}` : 'none',
      }} />
      {label}
    </span>
  );
}

const navBtnStyle: CSSProperties = {
  background: 'transparent',
  border: '1.5px dashed var(--umber-soft)',
  borderRadius: '8px 3px 8px 3px',
  color: 'var(--umber)',
  padding: '6px 8px',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'var(--sans)',
};
