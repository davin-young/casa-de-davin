'use client';

import { useState, useEffect, CSSProperties, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { HouseGlyph } from '@/components/icons';
import { Toast } from '@/components/shared';
import { WeatherChip } from '@/components/silly';
import { TWEAK_DEFAULTS, TweaksPanel, type Tweaks } from '@/components/tweaks';
import SiteGate from '@/components/site-gate';

type AccentMap = Record<string, string>;

export default function SiteLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [siteUnlocked, setSiteUnlocked] = useState(false);
  const [tweaks, setTweaks] = useState<Tweaks>(TWEAK_DEFAULTS);
  const [editMode, setEditMode] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setSiteUnlocked(localStorage.getItem('casa_site_ok') === '1');

    fetch('/api/auth/status')
      .then(r => r.json())
      .then((data: { isGuest: boolean; isAdmin: boolean }) => {
        if (data.isGuest || data.isAdmin) {
          setSiteUnlocked(true);
          localStorage.setItem('casa_site_ok', '1');
        } else {
          setSiteUnlocked(false);
          localStorage.removeItem('casa_site_ok');
        }
      })
      .catch(() => {})
      .finally(() => setMounted(true));
  }, []);

  // Listen for toast events from child pages
  useEffect(() => {
    const handler = (e: CustomEvent<string>) => {
      setToast(e.detail);
      setTimeout(() => setToast(null), 2600);
    };
    window.addEventListener('casa:toast', handler as EventListener);
    return () => window.removeEventListener('casa:toast', handler as EventListener);
  }, []);

  // Edit mode wiring (for iframe editor)
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

  // Theming
  const accentColorMap: AccentMap = { moss: '#5a7d3a', terracotta: '#c97b5e', umber: '#7a3e2a' };
  const accentColor = accentColorMap[tweaks.primaryAccent] || '#5a7d3a';

  const accentDarkMap: AccentMap = { moss: '#466029', terracotta: '#a85e44', umber: '#5a2c1e' };
  const accentDark = accentDarkMap[tweaks.primaryAccent] || '#466029';

  const paperBgMap: AccentMap = { oat: '#f2ead8', linen: '#e8dfc4', dusk: '#d6c8a3' };
  const paperBg = paperBgMap[tweaks.paperTone] || '#f2ead8';

  const paperDeepMap: AccentMap = { oat: '#ebe1c7', linen: '#ddd2b3', dusk: '#c7b78e' };
  const paperDeep = paperDeepMap[tweaks.paperTone] || '#ebe1c7';

  const handleSiteUnlock = () => {
    setSiteUnlocked(true);
    localStorage.setItem('casa_site_ok', '1');
  };

  if (!mounted) return null;

  if (!siteUnlocked) {
    return <SiteGate onUnlock={handleSiteUnlock} />;
  }

  const navItems: { href: string; label: string }[] = [
    { href: '/', label: 'Rooms' },
    { href: '/about', label: 'About' },
    { href: '/guestbook', label: 'Guestbook' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

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
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <HouseGlyph size={26} />
            <span className="serif-display" style={{ fontSize: 19, fontWeight: 600, color: 'var(--ink, #2b3524)' }}>
              Casa de Davin
            </span>
          </Link>

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

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12 }}>
          {navItems.map(({ href, label }) => (
            <Link key={href} href={href} style={{
              background: isActive(href) ? 'rgba(90,125,58,0.12)' : 'transparent',
              border: 'none',
              color: isActive(href) ? 'var(--moss, #5a7d3a)' : 'var(--ink-soft, #6b7a5e)',
              padding: '7px 16px',
              borderRadius: '8px 3px 8px 3px',
              fontSize: 13,
              fontFamily: 'var(--sans)',
              fontWeight: isActive(href) ? 600 : 400,
              cursor: 'pointer',
              letterSpacing: '0.04em',
              transition: 'all 0.15s ease',
              textDecoration: 'none',
            }}>
              {label}
            </Link>
          ))}
          <div style={{ flex: 1 }} />
          <Link href="/admin" style={{
            background: pathname.startsWith('/admin') ? 'rgba(90,125,58,0.1)' : 'transparent',
            border: '1.5px solid var(--umber-soft, rgba(122,62,42,0.25))',
            color: pathname.startsWith('/admin') ? 'var(--moss, #5a7d3a)' : 'var(--ink-soft, #6b7a5e)',
            padding: '6px 14px',
            borderRadius: '8px 3px 8px 3px',
            fontSize: 12,
            fontFamily: 'var(--sans)',
            fontWeight: 500,
            cursor: 'pointer',
            letterSpacing: '0.06em',
            textDecoration: 'none',
          }}>
            Admin
          </Link>
        </div>
      </nav>

      {/* Page content */}
      <main style={{ maxWidth: 1200, margin: '0 auto' }}>
        {children}
      </main>

      {/* Toast */}
      {toast && <Toast>{toast}</Toast>}

      {/* Tweaks panel */}
      <TweaksPanel tweaks={tweaks} onChange={updateTweaks} visible={editMode}/>
    </div>
  );
}
