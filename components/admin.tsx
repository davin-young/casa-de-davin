'use client';

import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, HouseGlyph, CouchGlyph, BedGlyph, CheckIcon, XIcon } from './icons';
import { PaperSurface, MossButton, SectionLabel, SprigDivider } from './shared';
import AdminCalendar from './admin-calendar';

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

interface AdminPanelProps {
  onBack: () => void;
  adminEmail?: string;
}

interface StatTileProps {
  big: number;
  label: string;
  accent: string;
}

interface BookingRowProps {
  booking: BookingRecord;
  selected: boolean;
  checked: boolean;
  onSelect: () => void;
  onToggleCheck: () => void;
  last: boolean;
}

interface StatusPillProps {
  status: BookingStatus;
  color: string;
}

interface BookingDetailProps {
  booking: BookingRecord;
  allBookings: BookingRecord[];
  onUpdate: (id: string, status: BookingStatus) => void;
  onDelete: (id: string) => void;
  onNotesUpdate: (id: string, notes: string) => void;
  onClose: () => void;
}

interface DetailRowProps {
  label: string;
  value: string | number;
}

interface ActivityItem {
  when: string;
  who: string;
  what: string;
}

interface CalendarBlackout {
  id: string;
  startDate: string;
  endDate: string;
  label: string;
  room: 'couch' | 'bedroom' | null;
}

export default function AdminPanel({ onBack, adminEmail }: AdminPanelProps) {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [calBlackouts, setCalBlackouts] = useState<CalendarBlackout[]>([]);
  const [filter, setFilter] = useState<'all' | BookingStatus>('all');
  const [selected, setSelected] = useState<BookingRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());

  const handleAuthError = useCallback((res: Response) => {
    if (res.status === 401) {
      window.location.href = '/login?auth_error=session_expired';
    }
  }, []);

  const fetchBookings = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/bookings');
      handleAuthError(res);
      const data = await res.json() as { ok: boolean; bookings?: BookingRecord[]; error?: string };
      if (data.ok && data.bookings) {
        setBookings(data.bookings);
      }
    } catch {
      // silently fail — admin can refresh
    } finally {
      setLoading(false);
    }
  }, [handleAuthError]);

  const fetchCalBlackouts = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/blackouts');
      handleAuthError(res);
      const data = await res.json() as { ok: boolean; blackouts?: CalendarBlackout[] };
      if (data.ok && data.blackouts) setCalBlackouts(data.blackouts);
    } catch {}
  }, [handleAuthError]);

  useEffect(() => { fetchBookings(); fetchCalBlackouts(); }, [fetchBookings, fetchCalBlackouts]);

  // Search + filter
  const searchLower = search.toLowerCase();
  const searched = search
    ? bookings.filter(b =>
        b.name.toLowerCase().includes(searchLower) ||
        b.ref.toLowerCase().includes(searchLower) ||
        b.why.toLowerCase().includes(searchLower))
    : bookings;
  const filtered = filter === 'all' ? searched : searched.filter(b => b.status === filter);
  const counts: Record<'all' | BookingStatus, number> = {
    all: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    approved: bookings.filter(b => b.status === 'approved').length,
    declined: bookings.filter(b => b.status === 'declined').length,
  };

  const updateStatus = async (id: string, status: BookingStatus) => {
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      handleAuthError(res);
      if (res.ok) {
        setBookings(bs => bs.map(b => b.id === id ? { ...b, status } : b));
        if (selected?.id === id) setSelected({ ...selected, status });
      }
    } catch {
      // silently fail
    }
  };

  const deleteBooking = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, { method: 'DELETE' });
      handleAuthError(res);
      if (res.ok) {
        setBookings(bs => bs.filter(b => b.id !== id));
        if (selected?.id === id) setSelected(null);
        setCheckedIds(prev => { const next = new Set(prev); next.delete(id); return next; });
      }
    } catch {}
  };

  const updateNotes = async (id: string, notes: string) => {
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: notes || null }),
      });
      handleAuthError(res);
      if (res.ok) {
        setBookings(bs => bs.map(b => b.id === id ? { ...b, notes: notes || null } : b));
        if (selected?.id === id) setSelected({ ...selected, notes: notes || null });
      }
    } catch {}
  };

  const toggleCheck = (id: string) => {
    setCheckedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const bulkAction = async (action: 'approve' | 'decline' | 'delete') => {
    const ids = Array.from(checkedIds);
    for (const id of ids) {
      if (action === 'delete') await deleteBooking(id);
      else await updateStatus(id, action === 'approve' ? 'approved' : 'declined');
    }
    setCheckedIds(new Set());
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  return (
    <PaperSurface style={{ minHeight: '100%', paddingBottom: 60 }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '22px 40px 10px',
        maxWidth: 1240, margin: '0 auto',
      }}>
        <button onClick={onBack} style={{
          background: 'transparent', border: 'none', color: 'var(--umber)',
          fontFamily: 'var(--sans)', fontSize: 14, display: 'inline-flex',
          alignItems: 'center', gap: 6, cursor: 'pointer', padding: '6px 10px 6px 2px',
        }}>
          <ArrowLeft size={16}/> back to the house
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <HouseGlyph size={22}/>
          <span className="serif-display" style={{ fontSize: 16, fontWeight: 600 }}>Casa de Davin</span>
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.2em',
            textTransform: 'uppercase',
            padding: '3px 8px', marginLeft: 8,
            background: 'var(--umber)', color: 'var(--oat)',
            borderRadius: '6px 2px 6px 2px',
          }}>admin</span>
          {adminEmail && (
            <span style={{ fontSize: 11, color: 'var(--ink-soft)', fontStyle: 'italic', marginLeft: 6 }}>
              {adminEmail}
            </span>
          )}
          <button onClick={handleLogout} style={{
            background: 'transparent',
            border: '1px dashed var(--umber-soft)',
            color: 'var(--ink-soft)',
            padding: '4px 10px',
            borderRadius: '6px 2px 6px 2px',
            fontSize: 11,
            fontFamily: 'var(--sans)',
            cursor: 'pointer',
            marginLeft: 4,
          }}>
            Sign out
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '16px 40px 24px' }}>
        <SectionLabel>Host dashboard</SectionLabel>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 20, flexWrap: 'wrap', marginTop: 10 }}>
          <h1 className="serif-display" style={{ fontSize: 56, lineHeight: 1, margin: 0, letterSpacing: '-0.02em' }}>
            Who&apos;s begging<br/>
            <span style={{ fontStyle: 'italic', color: 'var(--umber)' }}>to stay?</span>
          </h1>
          <div style={{ display: 'flex', gap: 14 }}>
            <StatTile big={counts.pending} label="pending" accent="var(--honey)"/>
            <StatTile big={counts.approved} label="approved" accent="var(--moss)"/>
            <StatTile big={counts.declined} label="declined" accent="var(--terracotta-deep)"/>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 40px', display: 'grid', gridTemplateColumns: '1fr 420px', gap: 32, alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 12, alignItems: 'center' }}>
            {(['all', 'pending', 'approved', 'declined'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{
                  padding: '7px 14px',
                  fontSize: 13,
                  fontFamily: 'var(--sans)',
                  fontWeight: 500,
                  textTransform: 'capitalize',
                  background: filter === f ? 'var(--moss)' : 'transparent',
                  color: filter === f ? 'var(--oat)' : 'var(--ink)',
                  border: filter === f ? '1.5px solid var(--moss-dark)' : '1.5px dashed var(--umber-soft)',
                  borderRadius: '10px 4px 10px 4px',
                  cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                }}>
                {f} <span style={{ opacity: 0.7, fontSize: 11 }}>{counts[f]}</span>
              </button>
            ))}
            <span className="hand" style={{ marginLeft: 'auto', fontSize: 20, color: 'var(--umber-soft)' }}>
              {counts.pending > 0 ? `${counts.pending} want your attention →` : 'nothing pending. nap?'}
            </span>
          </div>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, ref, or reason..."
            style={{
              width: '100%',
              padding: '10px 14px',
              fontSize: 14,
              fontFamily: 'var(--sans)',
              background: 'rgba(242,234,216,0.6)',
              border: '1.5px dashed var(--umber-soft)',
              borderRadius: '10px 4px 10px 4px',
              color: 'var(--ink)',
              outline: 'none',
              marginBottom: 12,
            }}
          />

          {checkedIds.size > 0 && (
            <div style={{
              display: 'flex', gap: 8, marginBottom: 12, padding: '10px 14px',
              background: 'rgba(228,169,75,0.15)',
              border: '1px dashed var(--honey)',
              borderRadius: '10px 4px 10px 4px',
              alignItems: 'center',
            }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>
                {checkedIds.size} selected
              </span>
              <span style={{ flex: 1 }} />
              <MossButton onClick={() => bulkAction('approve')} size="sm">Approve all</MossButton>
              <MossButton onClick={() => bulkAction('decline')} variant="secondary" size="sm">Decline all</MossButton>
              <MossButton onClick={() => bulkAction('delete')} variant="ghost" size="sm">Delete all</MossButton>
            </div>
          )}

          <div style={{
            background: 'var(--linen)',
            border: '1.5px solid var(--umber-soft)',
            borderRadius: '16px 6px 16px 6px',
            overflow: 'hidden',
          }}>
            {filtered.length === 0 && (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--ink-soft)', fontStyle: 'italic', fontFamily: 'var(--serif)' }}>
                Nothing here. Suspicious.
              </div>
            )}
            {filtered.map((b, i) => (
              <BookingRow key={b.id} booking={b} selected={selected?.id === b.id} checked={checkedIds.has(b.id)} onSelect={() => setSelected(b)} onToggleCheck={() => toggleCheck(b.id)} last={i === filtered.length - 1}/>
            ))}
          </div>
        </div>

        <aside style={{ position: 'sticky', top: 20 }}>
          {selected ? (
            <BookingDetail booking={selected} allBookings={bookings} onUpdate={updateStatus} onDelete={deleteBooking} onNotesUpdate={updateNotes} onClose={() => setSelected(null)}/>
          ) : (
            <EmptyDetail/>
          )}
        </aside>
      </div>

      <div style={{ maxWidth: 1240, margin: '36px auto 0', padding: '0 40px' }}>
        <AdminCalendar
          bookings={bookings}
          blackouts={calBlackouts}
          onSelectBooking={(b) => setSelected(b)}
        />
      </div>

      <div style={{ maxWidth: 1240, margin: '36px auto 0', padding: '0 40px' }}>
        <InviteCodesSection />
      </div>

      <div style={{ maxWidth: 1240, margin: '36px auto 0', padding: '0 40px' }}>
        <AnalyticsSection />
      </div>

      <div style={{ maxWidth: 1240, margin: '36px auto 0', padding: '0 40px' }}>
        <BlackoutDatesSection />
      </div>

      <div style={{ maxWidth: 1240, margin: '36px auto 0', padding: '0 40px' }}>
        <ActivityStrip bookings={bookings}/>
      </div>
    </PaperSurface>
  );
}

function StatTile({ big, label, accent }: StatTileProps) {
  return (
    <div style={{
      padding: '12px 18px',
      background: 'var(--linen)',
      border: '1.5px solid var(--umber-soft)',
      borderRadius: '12px 4px 12px 4px',
      minWidth: 100,
      textAlign: 'left',
      position: 'relative',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: accent, borderRadius: '10px 4px 0 0' }}/>
      <div className="serif-display" style={{ fontSize: 38, fontWeight: 600, color: 'var(--ink)', lineHeight: 1 }}>{big}</div>
      <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--umber)', fontWeight: 600, marginTop: 4 }}>{label}</div>
    </div>
  );
}

function BookingRow({ booking, selected, checked, onSelect, onToggleCheck, last }: BookingRowProps) {
  const statusColor: Record<BookingStatus, string> = {
    pending: 'var(--honey)',
    approved: 'var(--moss)',
    declined: 'var(--terracotta-deep)',
  };

  return (
    <div onClick={onSelect} style={{
      padding: '16px 20px',
      borderBottom: last ? 'none' : '1px dashed var(--umber-soft)',
      background: selected ? 'rgba(228,169,75,0.18)' : checked ? 'rgba(90,125,58,0.08)' : 'transparent',
      cursor: 'pointer',
      display: 'grid',
      gridTemplateColumns: 'auto 1.2fr 1fr 0.8fr 0.6fr auto',
      gap: 14,
      alignItems: 'center',
      transition: 'background 160ms ease',
    }}>
      <input
        type="checkbox"
        checked={checked}
        onClick={(e) => e.stopPropagation()}
        onChange={onToggleCheck}
        style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--moss)' }}
      />
      <div>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 500, color: 'var(--ink)' }}>{booking.name}</div>
        <div style={{ fontSize: 11, color: 'var(--ink-soft)', fontStyle: 'italic', marginTop: 2 }}>submitted {formatRelative(booking.createdAt)}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {booking.room === 'couch' ? <CouchGlyph size={28}/> : <BedGlyph size={28}/>}
        <span style={{ fontSize: 13, color: 'var(--ink)' }}>
          {booking.room === 'couch' ? 'The Couch' : 'The Bedroom'}
        </span>
      </div>
      <div style={{ fontFamily: 'var(--serif)', fontSize: 13, color: 'var(--ink)' }}>
        {fmtShort(booking.arrive)} → {fmtShort(booking.depart)}
      </div>
      <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
        {nightsBetween(booking.arrive, booking.depart)} nights
      </div>
      <StatusPill status={booking.status} color={statusColor[booking.status]}/>
    </div>
  );
}

function StatusPill({ status, color }: StatusPillProps) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 10px',
      background: color,
      color: status === 'pending' ? 'var(--ink)' : 'var(--oat)',
      borderRadius: '8px 3px 8px 3px',
      fontSize: 10, fontWeight: 700,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
    }}>{status}</span>
  );
}

function BookingDetail({ booking, allBookings, onUpdate, onDelete, onNotesUpdate, onClose }: BookingDetailProps) {
  const [notesText, setNotesText] = useState(booking.notes || '');
  const [notesSaved, setNotesSaved] = useState(false);
  const [overlapWarning, setOverlapWarning] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Reset notes when booking changes
  useEffect(() => {
    setNotesText(booking.notes || '');
    setNotesSaved(false);
    setOverlapWarning(null);
    setConfirmDelete(false);
  }, [booking.id, booking.notes]);

  const saveNotes = () => {
    onNotesUpdate(booking.id, notesText);
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 1500);
  };

  const handleApprove = () => {
    // Check for overlapping approved bookings
    const overlaps = allBookings.filter(b =>
      b.id !== booking.id &&
      b.room === booking.room &&
      b.status === 'approved' &&
      b.arrive < booking.depart &&
      b.depart > booking.arrive
    );
    if (overlaps.length > 0) {
      const overlap = overlaps[0];
      setOverlapWarning(`This overlaps with ${overlap.name} on ${fmtShort(overlap.arrive)}–${fmtShort(overlap.depart)}. Approve anyway?`);
    } else {
      onUpdate(booking.id, 'approved');
    }
  };

  const confirmApprove = () => {
    setOverlapWarning(null);
    onUpdate(booking.id, 'approved');
  };

  return (
    <div style={{
      background: 'var(--linen)',
      border: '1.5px solid var(--umber-soft)',
      borderRadius: '20px 6px 20px 6px',
      padding: '24px 26px 28px',
      boxShadow: 'var(--shadow-soft)',
      position: 'relative',
    }}>
      <button onClick={onClose} style={{
        position: 'absolute', top: 14, right: 14,
        background: 'transparent', border: 'none', cursor: 'pointer',
        color: 'var(--umber)', padding: 4,
      }}><XIcon size={16}/></button>

      <SectionLabel>Request detail</SectionLabel>
      <h2 className="serif-display" style={{ fontSize: 32, margin: '10px 0 4px', letterSpacing: '-0.01em', fontWeight: 500 }}>
        {booking.name}
      </h2>
      <div style={{ fontSize: 12, color: 'var(--ink-soft)', fontStyle: 'italic', marginBottom: 18 }}>
        requested {formatRelative(booking.createdAt)} &middot; {booking.ref}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 20px', marginBottom: 18 }}>
        <DetailRow label="Room" value={booking.room === 'couch' ? 'The Couch' : 'The Bedroom'}/>
        <DetailRow label="Nights" value={nightsBetween(booking.arrive, booking.depart)}/>
        <DetailRow label="Arrives" value={fmtShort(booking.arrive)}/>
        <DetailRow label="Departs" value={fmtShort(booking.depart)}/>
      </div>

      <SprigDivider/>

      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--umber)', marginBottom: 6 }}>
          Why should I let them stay
        </div>
        <div style={{
          padding: '12px 14px',
          background: 'rgba(242,234,216,0.6)',
          border: '1px dashed var(--umber-soft)',
          borderRadius: '10px 4px 10px 4px',
          fontFamily: 'var(--serif)',
          fontSize: 15,
          color: 'var(--ink)',
          fontStyle: 'italic',
          lineHeight: 1.5,
        }}>&quot;{booking.why}&quot;</div>
      </div>

      {booking.travel && (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--umber)', marginBottom: 4 }}>Getting here</div>
          <div style={{ fontSize: 14, color: 'var(--ink)', fontFamily: 'var(--serif)' }}>{booking.travel}</div>
        </div>
      )}

      {/* Admin notes */}
      <div style={{ marginTop: 14 }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--umber)', marginBottom: 4 }}>
          Private notes
        </div>
        <textarea
          value={notesText}
          onChange={(e) => setNotesText(e.target.value)}
          placeholder="e.g. bringing a dog, needs parking info..."
          rows={2}
          style={{
            width: '100%',
            padding: '10px 12px',
            fontSize: 13,
            fontFamily: 'var(--serif)',
            background: 'rgba(242,234,216,0.5)',
            border: '1px dashed var(--umber-soft)',
            borderRadius: '8px 3px 8px 3px',
            color: 'var(--ink)',
            resize: 'vertical',
            outline: 'none',
          }}
        />
        <button onClick={saveNotes} style={{
          marginTop: 4,
          background: notesSaved ? 'var(--moss)' : 'transparent',
          border: `1px solid ${notesSaved ? 'var(--moss)' : 'var(--umber-soft)'}`,
          color: notesSaved ? 'var(--oat)' : 'var(--ink-soft)',
          padding: '3px 10px',
          borderRadius: '6px 2px 6px 2px',
          fontSize: 11,
          fontFamily: 'var(--sans)',
          cursor: 'pointer',
        }}>
          {notesSaved ? 'Saved!' : 'Save notes'}
        </button>
      </div>

      <SprigDivider/>

      {/* Overlap warning */}
      {overlapWarning && (
        <div style={{
          marginTop: 14, padding: '12px 14px',
          background: 'rgba(228,169,75,0.2)',
          border: '1px dashed var(--honey)',
          borderRadius: '10px 4px 10px 4px',
        }}>
          <p style={{ fontFamily: 'var(--serif)', fontSize: 14, color: 'var(--ink)', margin: '0 0 8px' }}>
            {overlapWarning}
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <MossButton onClick={confirmApprove} size="sm">Yes, approve anyway</MossButton>
            <MossButton onClick={() => setOverlapWarning(null)} variant="ghost" size="sm">Cancel</MossButton>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 18, flexWrap: 'wrap' }}>
        {booking.status !== 'approved' && (
          <MossButton onClick={handleApprove} size="sm">
            <CheckIcon size={14}/> Approve
          </MossButton>
        )}
        {booking.status !== 'declined' && (
          <MossButton onClick={() => onUpdate(booking.id, 'declined')} variant="secondary" size="sm">
            Kindly decline
          </MossButton>
        )}
        {booking.status !== 'pending' && (
          <MossButton onClick={() => onUpdate(booking.id, 'pending')} variant="ghost" size="sm">
            Reset to pending
          </MossButton>
        )}
      </div>

      {/* Delete */}
      <div style={{ marginTop: 14 }}>
        {confirmDelete ? (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--terracotta)' }}>Delete permanently?</span>
            <button onClick={() => onDelete(booking.id)} style={{
              background: 'var(--terracotta)',
              border: 'none',
              color: 'var(--oat)',
              padding: '4px 10px',
              borderRadius: '6px 2px 6px 2px',
              fontSize: 11,
              fontFamily: 'var(--sans)',
              fontWeight: 600,
              cursor: 'pointer',
            }}>Yes, delete</button>
            <button onClick={() => setConfirmDelete(false)} style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--ink-soft)',
              fontSize: 11,
              cursor: 'pointer',
            }}>Cancel</button>
          </div>
        ) : (
          <button onClick={() => setConfirmDelete(true)} style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--terracotta)',
            fontFamily: 'var(--serif)',
            fontSize: 12,
            fontStyle: 'italic',
            cursor: 'pointer',
            padding: 0,
            textDecoration: 'underline',
            textUnderlineOffset: 3,
          }}>
            Delete this booking
          </button>
        )}
      </div>

      {/* Calendar sync status + Add to Calendar */}
      <div style={{ marginTop: 14, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        {booking.calendarEventId && (
          <span style={{
            fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase',
            padding: '3px 8px',
            background: 'rgba(90,125,58,0.15)',
            borderRadius: '4px 2px 4px 2px',
            color: 'var(--moss)',
          }}>
            Synced to calendar
          </span>
        )}
        <a
          href={`https://calendar.google.com/calendar/r/eventedit?text=${encodeURIComponent(`${booking.name} → ${booking.room} (casa)`)}&dates=${booking.arrive.replace(/-/g, '')}/${booking.depart.replace(/-/g, '')}&details=${encodeURIComponent(`Ref: ${booking.ref}\nRoom: ${booking.room}\nWhy: "${booking.why}"`)}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: 11,
            color: 'var(--moss)',
            fontFamily: 'var(--sans)',
            textDecoration: 'none',
            border: '1px dashed var(--moss)',
            padding: '3px 8px',
            borderRadius: '4px 2px 4px 2px',
          }}
        >
          Add to Google Calendar
        </a>
      </div>

      <div style={{ marginTop: 14, fontSize: 11, color: 'var(--ink-soft)', fontStyle: 'italic', opacity: 0.75 }}>
        Approving sends them an email. Declining sends a kinder one. Either way, I&apos;ll probably still text.
      </div>
    </div>
  );
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--umber)', marginBottom: 3 }}>{label}</div>
      <div style={{ fontFamily: 'var(--serif)', fontSize: 16, color: 'var(--ink)' }}>{value}</div>
    </div>
  );
}

function EmptyDetail() {
  return (
    <div style={{
      background: 'rgba(232,223,196,0.5)',
      border: '1.5px dashed var(--umber-soft)',
      borderRadius: '20px 6px 20px 6px',
      padding: '40px 28px',
      textAlign: 'center',
      color: 'var(--ink-soft)',
    }}>
      <div className="serif-display" style={{ fontSize: 22, margin: '10px 0 4px', color: 'var(--ink)', fontWeight: 500 }}>
        Pick a request
      </div>
      <div style={{ fontSize: 13, fontStyle: 'italic' }}>
        Tap anyone on the left. I&apos;ll show you their whole plea.
      </div>
    </div>
  );
}

interface InviteCode {
  id: string;
  code: string;
  note: string | null;
  createdAt: string;
  redeemedAt: string | null;
  redeemedBy: string | null;
}

function InviteCodesSection() {
  const [codes, setCodes] = useState<InviteCode[]>([]);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const fetchCodes = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/invites');
      const data = await res.json() as { ok: boolean; codes?: InviteCode[] };
      if (data.ok && data.codes) setCodes(data.codes);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCodes(); }, [fetchCodes]);

  const generate = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/admin/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: note.trim() || undefined }),
      });
      const data = await res.json() as { ok: boolean; codes?: InviteCode[] };
      if (data.ok && data.codes) {
        setCodes(prev => [...data.codes!, ...prev]);
        setNote('');
      }
    } catch {
      // silently fail
    } finally {
      setGenerating(false);
    }
  };

  const copyCode = (code: string) => {
    const url = `${window.location.origin}?code=${code}`;
    navigator.clipboard.writeText(url);
    setCopied(code);
    setTimeout(() => setCopied(null), 1500);
  };

  const revokeCode = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/invites/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCodes(prev => prev.filter(c => c.id !== id));
      }
    } catch {}
  };

  const unused = codes.filter(c => !c.redeemedAt);
  const used = codes.filter(c => c.redeemedAt);

  return (
    <section style={{
      padding: '24px 26px',
      background: 'var(--linen)',
      border: '1.5px solid var(--umber-soft)',
      borderRadius: '16px 6px 16px 6px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div>
          <SectionLabel>Invite codes</SectionLabel>
          <div style={{ fontSize: 13, color: 'var(--ink-soft)', fontStyle: 'italic', fontFamily: 'var(--serif)', marginTop: 2 }}>
            Generate one-time codes to share with friends.
          </div>
        </div>
        <StatTile big={unused.length} label="available" accent="var(--moss)" />
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, alignItems: 'center' }}>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Note (e.g. 'for Kevin')"
          style={{
            flex: 1,
            padding: '10px 14px',
            fontSize: 14,
            fontFamily: 'var(--sans)',
            background: 'rgba(242,234,216,0.6)',
            border: '1.5px dashed var(--umber-soft)',
            borderRadius: '10px 4px 10px 4px',
            color: 'var(--ink)',
            outline: 'none',
          }}
        />
        <MossButton onClick={generate} size="sm" disabled={generating}>
          {generating ? 'Generating...' : 'Generate code'}
        </MossButton>
      </div>

      {loading ? (
        <div style={{ padding: 20, textAlign: 'center', color: 'var(--ink-soft)', fontStyle: 'italic', fontFamily: 'var(--serif)' }}>
          Loading...
        </div>
      ) : codes.length === 0 ? (
        <div style={{ padding: 20, textAlign: 'center', color: 'var(--ink-soft)', fontStyle: 'italic', fontFamily: 'var(--serif)' }}>
          No codes yet. Generate one above.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {unused.map(c => (
            <div key={c.id} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '10px 14px',
              background: 'rgba(90,125,58,0.06)',
              border: '1px dashed var(--umber-soft)',
              borderRadius: '10px 4px 10px 4px',
            }}>
              <span style={{
                fontFamily: 'var(--mono)',
                fontSize: 18,
                fontWeight: 600,
                letterSpacing: '0.15em',
                color: 'var(--moss)',
              }}>{c.code}</span>
              {c.note && <span style={{ fontSize: 13, color: 'var(--ink-soft)', fontStyle: 'italic', fontFamily: 'var(--serif)' }}>{c.note}</span>}
              <span style={{ flex: 1 }} />
              <span style={{ fontSize: 11, color: 'var(--ink-soft)' }}>{formatRelative(c.createdAt)}</span>
              <button onClick={() => copyCode(c.code)} style={{
                background: copied === c.code ? 'var(--moss)' : 'transparent',
                border: `1.5px solid ${copied === c.code ? 'var(--moss)' : 'var(--umber-soft)'}`,
                color: copied === c.code ? 'var(--oat)' : 'var(--ink-soft)',
                padding: '4px 10px',
                borderRadius: '6px 2px 6px 2px',
                fontSize: 11,
                fontFamily: 'var(--sans)',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}>
                {copied === c.code ? 'Copied!' : 'Copy URL'}
              </button>
              <button onClick={() => revokeCode(c.id)} style={{
                background: 'transparent',
                border: '1px solid var(--umber-soft)',
                color: 'var(--terracotta)',
                padding: '4px 10px',
                borderRadius: '6px 2px 6px 2px',
                fontSize: 11,
                fontFamily: 'var(--sans)',
                fontWeight: 500,
                cursor: 'pointer',
              }}>
                Revoke
              </button>
            </div>
          ))}
          {used.length > 0 && (
            <>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--umber)', marginTop: 12, marginBottom: 4 }}>
                Used ({used.length})
              </div>
              {used.map(c => (
                <div key={c.id} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '8px 14px',
                  opacity: 0.5,
                }}>
                  <span style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 14,
                    letterSpacing: '0.15em',
                    color: 'var(--ink-soft)',
                    textDecoration: 'line-through',
                  }}>{c.code}</span>
                  {c.note && <span style={{ fontSize: 12, color: 'var(--ink-soft)', fontStyle: 'italic' }}>{c.note}</span>}
                  <span style={{ flex: 1 }} />
                  <span style={{ fontSize: 11, color: 'var(--ink-soft)' }}>
                    used {c.redeemedAt ? formatRelative(c.redeemedAt) : ''}
                  </span>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </section>
  );
}

interface StatsData {
  totalBookings: number;
  approvedStays: number;
  pendingRequests: number;
  declinedRequests: number;
  bookingsThisMonth: number;
  roomSplit: { couch: number; bedroom: number };
  averageStayNights: number;
  inviteRedemptionRate: number;
}

function AnalyticsSection() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then((data: { ok: boolean } & StatsData) => {
        if (data.ok) setStats(data);
      })
      .catch(() => {});
  }, []);

  if (!stats) return null;

  return (
    <section style={{
      padding: '24px 26px',
      background: 'var(--linen)',
      border: '1.5px solid var(--umber-soft)',
      borderRadius: '16px 6px 16px 6px',
    }}>
      <button onClick={() => setExpanded(!expanded)} style={{
        background: 'transparent', border: 'none', cursor: 'pointer',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        width: '100%', padding: 0,
      }}>
        <div>
          <SectionLabel>Analytics</SectionLabel>
          <div style={{ fontSize: 13, color: 'var(--ink-soft)', fontStyle: 'italic', fontFamily: 'var(--serif)', marginTop: 2, textAlign: 'left' }}>
            Booking stats and trends.
          </div>
        </div>
        <span style={{ fontSize: 18, color: 'var(--umber)', transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          ▾
        </span>
      </button>

      {expanded && (
        <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          <MetricCard label="This month" value={stats.bookingsThisMonth} />
          <MetricCard label="Avg stay" value={`${stats.averageStayNights} nights`} />
          <MetricCard label="Room split" value={`${stats.roomSplit.bedroom}B / ${stats.roomSplit.couch}C`} />
          <MetricCard label="Invite rate" value={`${stats.inviteRedemptionRate}%`} />
        </div>
      )}
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{
      padding: '14px 16px',
      background: 'rgba(242,234,216,0.6)',
      border: '1px dashed var(--umber-soft)',
      borderRadius: '10px 4px 10px 4px',
    }}>
      <div style={{ fontFamily: 'var(--serif)', fontSize: 24, fontWeight: 600, color: 'var(--ink)' }}>{value}</div>
      <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--umber)', fontWeight: 600, marginTop: 4 }}>{label}</div>
    </div>
  );
}

interface BlackoutRecord {
  id: string;
  startDate: string;
  endDate: string;
  label: string;
  room: 'couch' | 'bedroom' | null;
  createdAt: string;
}

function BlackoutDatesSection() {
  const [blackouts, setBlackouts] = useState<BlackoutRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [label, setLabel] = useState('');
  const [room, setRoom] = useState<'couch' | 'bedroom' | ''>('');
  const [adding, setAdding] = useState(false);

  const fetchBlackouts = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/blackouts');
      const data = await res.json() as { ok: boolean; blackouts?: BlackoutRecord[] };
      if (data.ok && data.blackouts) setBlackouts(data.blackouts);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBlackouts(); }, [fetchBlackouts]);

  const addBlackout = async () => {
    if (!startDate || !endDate || !label.trim()) return;
    setAdding(true);
    try {
      const res = await fetch('/api/admin/blackouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate,
          endDate,
          label: label.trim(),
          room: room || null,
        }),
      });
      const data = await res.json() as { ok: boolean; blackout?: BlackoutRecord };
      if (data.ok && data.blackout) {
        setBlackouts(prev => [data.blackout!, ...prev]);
        setStartDate('');
        setEndDate('');
        setLabel('');
        setRoom('');
      }
    } catch {
      // silently fail
    } finally {
      setAdding(false);
    }
  };

  const deleteBlackout = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/blackouts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setBlackouts(prev => prev.filter(b => b.id !== id));
      }
    } catch {
      // silently fail
    }
  };

  return (
    <section style={{
      padding: '24px 26px',
      background: 'var(--linen)',
      border: '1.5px solid var(--umber-soft)',
      borderRadius: '16px 6px 16px 6px',
    }}>
      <div style={{ marginBottom: 18 }}>
        <SectionLabel>Blackout dates</SectionLabel>
        <div style={{ fontSize: 13, color: 'var(--ink-soft)', fontStyle: 'italic', fontFamily: 'var(--serif)', marginTop: 2 }}>
          Block off dates when the apartment is unavailable.
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--umber)', marginBottom: 4 }}>Start</div>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
            style={dateInputStyle} />
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--umber)', marginBottom: 4 }}>End</div>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
            style={dateInputStyle} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--umber)', marginBottom: 4 }}>Reason</div>
          <input type="text" value={label} onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Out of town"
            style={{
              width: '100%',
              padding: '10px 14px',
              fontSize: 14,
              fontFamily: 'var(--sans)',
              background: 'rgba(242,234,216,0.6)',
              border: '1.5px dashed var(--umber-soft)',
              borderRadius: '10px 4px 10px 4px',
              color: 'var(--ink)',
              outline: 'none',
            }} />
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--umber)', marginBottom: 4 }}>Room</div>
          <select value={room} onChange={(e) => setRoom(e.target.value as typeof room)}
            style={{
              padding: '10px 14px',
              fontSize: 14,
              fontFamily: 'var(--sans)',
              background: 'rgba(242,234,216,0.6)',
              border: '1.5px dashed var(--umber-soft)',
              borderRadius: '10px 4px 10px 4px',
              color: 'var(--ink)',
              outline: 'none',
            }}>
            <option value="">Both rooms</option>
            <option value="couch">Couch only</option>
            <option value="bedroom">Bedroom only</option>
          </select>
        </div>
        <MossButton onClick={addBlackout} size="sm" disabled={adding || !startDate || !endDate || !label.trim()}>
          {adding ? 'Adding...' : 'Add blackout'}
        </MossButton>
      </div>

      {loading ? (
        <div style={{ padding: 20, textAlign: 'center', color: 'var(--ink-soft)', fontStyle: 'italic', fontFamily: 'var(--serif)' }}>
          Loading...
        </div>
      ) : blackouts.length === 0 ? (
        <div style={{ padding: 20, textAlign: 'center', color: 'var(--ink-soft)', fontStyle: 'italic', fontFamily: 'var(--serif)' }}>
          No blackout dates set. The calendar is wide open.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {blackouts.map(b => (
            <div key={b.id} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '10px 14px',
              background: 'rgba(122,62,42,0.04)',
              border: '1px dashed var(--umber-soft)',
              borderRadius: '10px 4px 10px 4px',
            }}>
              <span style={{ fontFamily: 'var(--serif)', fontSize: 14, color: 'var(--ink)' }}>
                {fmtShort(b.startDate)} → {fmtShort(b.endDate)}
              </span>
              <span style={{ fontSize: 13, color: 'var(--ink-soft)', fontStyle: 'italic', fontFamily: 'var(--serif)' }}>
                {b.label}
              </span>
              {b.room && (
                <span style={{
                  fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase',
                  padding: '2px 8px',
                  background: b.room === 'couch' ? 'rgba(228,169,75,0.2)' : 'rgba(90,125,58,0.15)',
                  borderRadius: '4px 2px 4px 2px',
                  color: 'var(--ink-soft)',
                }}>
                  {b.room}
                </span>
              )}
              <span style={{ flex: 1 }} />
              <button onClick={() => deleteBlackout(b.id)} style={{
                background: 'transparent',
                border: '1.5px solid var(--umber-soft)',
                color: 'var(--terracotta)',
                padding: '4px 10px',
                borderRadius: '6px 2px 6px 2px',
                fontSize: 11,
                fontFamily: 'var(--sans)',
                fontWeight: 500,
                cursor: 'pointer',
              }}>
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

const dateInputStyle: React.CSSProperties = {
  padding: '10px 14px',
  fontSize: 14,
  fontFamily: 'var(--sans)',
  background: 'rgba(242,234,216,0.6)',
  border: '1.5px dashed var(--umber-soft)',
  borderRadius: '10px 4px 10px 4px',
  color: 'var(--ink)',
  outline: 'none',
};

function ActivityStrip({ bookings }: { bookings: BookingRecord[] }) {
  // Derive activity from bookings, sorted by most recent update
  const items: ActivityItem[] = [...bookings]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 8)
    .map(b => {
      const room = b.room === 'couch' ? 'couch' : 'bedroom';
      const dates = `${fmtShort(b.arrive)}–${fmtShort(b.depart)}`;
      if (b.status === 'approved' && b.updatedAt !== b.createdAt) {
        return { when: formatRelative(b.updatedAt), who: 'you', what: `approved ${b.name} (${room} · ${dates})` };
      }
      if (b.status === 'declined' && b.updatedAt !== b.createdAt) {
        return { when: formatRelative(b.updatedAt), who: 'you', what: `declined ${b.name} (${room} · ${dates})` };
      }
      return { when: formatRelative(b.createdAt), who: b.name, what: `submitted a request for the ${room}` };
    });

  if (items.length === 0) return null;

  return (
    <section style={{
      padding: '20px 26px',
      background: 'rgba(232,223,196,0.4)',
      border: '1px dashed var(--umber-soft)',
      borderRadius: '14px 6px 14px 6px',
    }}>
      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--umber)', marginBottom: 12 }}>Recent activity</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map((it, i) => (
          <div key={i} style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--ink)', alignItems: 'baseline' }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-soft)', minWidth: 80 }}>{it.when}</span>
            <span style={{ fontWeight: 500 }}>{it.who}</span>
            <span style={{ color: 'var(--ink-soft)' }}>{it.what}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function formatRelative(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHr = Math.floor(diffMs / 3_600_000);
  const diffDay = Math.floor(diffMs / 86_400_000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay === 1) return 'yesterday';
  return `${diffDay} days ago`;
}

function fmtShort(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function nightsBetween(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}
