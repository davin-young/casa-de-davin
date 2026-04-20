'use client';

import { useState, useEffect, CSSProperties } from 'react';
import { HouseGlyph } from './icons';
import { Toast } from './shared';
import { WeatherChip } from './silly';
import { TWEAK_DEFAULTS, TweaksPanel, type Tweaks } from './tweaks';
import Landing from './landing';
import BookingForm, { type Booking } from './form';
import Confirmation from './confirmation';
import AdminPanel from './admin';
import { AdminGate, AboutPage, Guestbook, ErrorScreen, SharePage, EmailPreviews, HandoffDoc, GuestGate } from './extras';

type Screen = 'landing' | 'form' | 'confirmation' | 'admin' | 'about' | 'guestbook' | 'error' | 'share' | 'emails' | 'handoff';
type Room = 'bedroom' | 'couch';

type AccentMap = Record<string, string>;

export default function App() {
  const [screen, setScreen] = useState<Screen>(() => {
    if (typeof window === 'undefined') return 'landing';
    return (localStorage.getItem('casa_screen') as Screen) || 'landing';
  });
  const [room, setRoom] = useState<Room>(() => {
    if (typeof window === 'undefined') return 'bedroom';
    return (localStorage.getItem('casa_room') as Room) || 'bedroom';
  });
  const [booking, setBooking] = useState<Booking | null>(() => {
    if (typeof window === 'undefined') return null;
    try { return JSON.parse(localStorage.getItem('casa_booking') || 'null'); } catch { return null; }
  });
  const [adminUnlocked, setAdminUnlocked] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('casa_admin_ok') === '1';
  });
  const [guestUnlocked, setGuestUnlocked] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('casa_guest_ok') === '1';
  });
  const [guestGateOpen, setGuestGateOpen] = useState<boolean>(false);
  const [pendingRoom, setPendingRoom] = useState<Room | null>(null);
  const [tweaks, setTweaks] = useState<Tweaks>(TWEAK_DEFAULTS);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [toast, setToast] = useState<string | null>(null);

  // Persist
  useEffect(() => { localStorage.setItem('casa_screen', screen); }, [screen]);
  useEffect(() => { localStorage.setItem('casa_room', room); }, [room]);
  useEffect(() => {
    if (booking) localStorage.setItem('casa_booking', JSON.stringify(booking, (_k: string, v: unknown) => v instanceof Date ? { __date: v.toISOString() } : v));
  }, [booking]);

  // Edit mode wiring
  useEffect(() => {
    const handler = (ev: MessageEvent) => {
      const msg = ev.data;
      if (!msg || typeof msg !== 'object') return;
      if (msg.type === '__activate_edit_mode') setEditMode(true);
      if (msg.type === '__deactivate_edit_mode') setEditMode(false);
    };
    window.addEventListener('message', handler);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', handler);
  }, []);

  const updateTweaks = (next: Tweaks) => {
    setTweaks(next);
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits: next }, '*');
  };

  // Accent color
  const accentColorMap: AccentMap = {
    moss: '#5a7d3a',
    terracotta: '#c97b5e',
    umber: '#7a3e2a',
  };
  const accentColor = accentColorMap[tweaks.primaryAccent] || '#5a7d3a';

  const accentDarkMap: AccentMap = {
    moss: '#466029',
    terracotta: '#a85e44',
    umber: '#5a2c1e',
  };
  const accentDark = accentDarkMap[tweaks.primaryAccent] || '#466029';

  const paperBgMap: AccentMap = {
    oat: '#f2ead8',
    linen: '#e8dfc4',
    dusk: '#d6c8a3',
  };
  const paperBg = paperBgMap[tweaks.paperTone] || '#f2ead8';

  const paperDeepMap: AccentMap = {
    oat: '#ebe1c7',
    linen: '#ddd2b3',
    dusk: '#c7b78e',
  };
  const paperDeep = paperDeepMap[tweaks.paperTone] || '#ebe1c7';

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  const handlePickRoom = (r: Room) => {
    if (!guestUnlocked) {
      setPendingRoom(r);
      setGuestGateOpen(true);
      return;
    }
    setRoom(r);
    setScreen('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const handleGuestUnlock = () => {
    setGuestUnlocked(true);
    localStorage.setItem('casa_guest_ok', '1');
    setGuestGateOpen(false);
    if (pendingRoom) {
      setRoom(pendingRoom);
      setScreen('form');
      setPendingRoom(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  const handleBack = () => {
    setScreen('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const handleSubmit = (b: Booking) => {
    setBooking(b);
    setScreen('confirmation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('Sent. Calendar event added. Plants notified.');
  };
  const handleBookOther = () => {
    setRoom(room === 'couch' ? 'bedroom' : 'couch');
    setScreen('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const mainNavItems: [Screen, string][] = [
    ['landing', 'Rooms'],
    ['about', 'About'],
    ['guestbook', 'Guestbook'],
  ];

  return (
    <div style={{
      '--moss': accentColor,
      '--moss-dark': accentDark,
      '--oat': paperBg,
      '--oat-deep': paperDeep,
      minHeight: '100vh',
      background: paperBg,
    } as CSSProperties}>
      {/* Site nav */}
      <nav style={{
        maxWidth: 1120,
        margin: '0 auto',
        padding: '18px 40px 14px',
        borderBottom: '1.5px dashed var(--umber-soft, rgba(122,62,42,0.25))',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: paperBg,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={() => setScreen('landing')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <HouseGlyph size={26} />
            <span className="serif-display" style={{
              fontSize: 19,
              fontWeight: 600,
              color: 'var(--ink, #2b3524)',
            }}>Casa de Davin</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 24, fontSize: 13, color: 'var(--ink-soft, #6b7a5e)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: 8, background: 'var(--moss)', boxShadow: '0 0 0 3px rgba(90,125,58,0.18)' }}/>
              Accepting guests
            </span>
            <span style={{ opacity: 0.7 }}>Denver·ish, CO</span>
            <span className="hand" style={{ fontSize: 20, color: 'var(--umber, #7a3e2a)', transform: 'rotate(-3deg)', display: 'inline-block' }}>
              est. whenever
            </span>
            {tweaks.silly && <WeatherChip/>}
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginTop: 12,
        }}>
          {mainNavItems.map(([k, label]) => (
            <button key={k} onClick={() => setScreen(k)} style={{
              background: screen === k ? 'rgba(90,125,58,0.12)' : 'transparent',
              border: 'none',
              color: screen === k ? 'var(--moss, #5a7d3a)' : 'var(--ink-soft, #6b7a5e)',
              padding: '7px 16px',
              borderRadius: '8px 3px 8px 3px',
              fontSize: 13,
              fontFamily: 'var(--sans)',
              fontWeight: screen === k ? 600 : 400,
              cursor: 'pointer',
              letterSpacing: '0.04em',
              transition: 'all 0.15s ease',
            }}>
              {label}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <button onClick={() => setScreen('admin')} style={{
            background: screen === 'admin' ? 'rgba(90,125,58,0.1)' : 'transparent',
            border: '1.5px solid var(--umber-soft, rgba(122,62,42,0.25))',
            color: screen === 'admin' ? 'var(--moss, #5a7d3a)' : 'var(--ink-soft, #6b7a5e)',
            padding: '6px 14px',
            borderRadius: '8px 3px 8px 3px',
            fontSize: 12,
            fontFamily: 'var(--sans)',
            fontWeight: 500,
            cursor: 'pointer',
            letterSpacing: '0.06em',
          }}>
            Admin
          </button>
        </div>
      </nav>

      {/* Page content */}
      <main style={{ maxWidth: 1200, margin: '0 auto' }}>
        {screen === 'landing' && (
          <Landing
            onPickRoom={handlePickRoom}
            heroVariant={tweaks.heroVariant}
            tone={tweaks.tone}
            silly={tweaks.silly}
          />
        )}
        {screen === 'form' && (
          <BookingForm
            room={room}
            onBack={handleBack}
            onSubmit={handleSubmit}
            silly={tweaks.silly}
          />
        )}
        {screen === 'confirmation' && (
          <Confirmation
            booking={booking}
            onBackToRooms={handleBack}
            onBookOther={handleBookOther}
            particleDensity={tweaks.particleDensity}
            onShare={() => setScreen('share')}
          />
        )}
        {screen === 'admin' && (
          adminUnlocked
            ? <AdminPanel onBack={handleBack}/>
            : <AdminGate onUnlock={() => { setAdminUnlocked(true); localStorage.setItem('casa_admin_ok', '1'); }}/>
        )}
        {screen === 'about' && <AboutPage onBack={handleBack}/>}
        {screen === 'guestbook' && <Guestbook onBack={handleBack}/>}
        {screen === 'error' && <ErrorScreen onRetry={handleBack} onHome={handleBack}/>}
        {screen === 'share' && <SharePage onBack={handleBack} booking={booking}/>}
        {screen === 'emails' && <EmailPreviews onBack={handleBack}/>}
        {screen === 'handoff' && <HandoffDoc onBack={handleBack}/>}
      </main>

      {/* Toast */}
      {toast && <Toast>{toast}</Toast>}

      {/* Guest password gate */}
      {guestGateOpen && (
        <GuestGate
          onUnlock={handleGuestUnlock}
          onCancel={() => { setGuestGateOpen(false); setPendingRoom(null); }}
          room={pendingRoom}
        />
      )}

      {/* Tweaks panel */}
      <TweaksPanel tweaks={tweaks} onChange={updateTweaks} visible={editMode}/>
    </div>
  );
}

