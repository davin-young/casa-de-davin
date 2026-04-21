'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, HouseGlyph, XIcon, Sprout } from './icons';
import { PaperSurface, MossButton, SectionLabel, SprigDivider, SunRating } from './shared';

// ── Interfaces ──────────────────────────────────────────────────────

interface AdminGateProps {
  onUnlock: () => void;
}

interface AboutPageProps {
  onBack: () => void;
}

interface GuestbookProps {
  onBack: () => void;
}

interface ErrorScreenProps {
  onRetry: () => void;
  onHome: () => void;
}

interface ShareBooking {
  name: string;
  room: string;
  dates?: string;
  nights?: number;
  why: string;
  submitted?: string;
  ref?: string;
  range?: { start: Date | null; end: Date | null };
  travel?: string;
}

interface SharePageProps {
  onBack: () => void;
  booking: ShareBooking | null;
}

interface EmailPreviewsProps {
  onBack: () => void;
}

interface HandoffDocProps {
  onBack: () => void;
}

interface GuestGateProps {
  onUnlock: () => void;
  onCancel: () => void;
  room: string | null;
}

// GuestbookEntry now fetched from API (see GuestbookApiEntry)

interface EmailTemplate {
  subject: string;
  from: string;
  to: string;
  preview: string;
  greeting: string;
  body: string[];
  signoff: string;
  cta: string;
}

interface PlaceholderImageProps {
  label: string;
  height?: number;
}

interface FactBlockProps {
  title: string;
  big: string;
  sub: string;
}

// GuestCardProps inlined in the new GuestCard component

interface EmailCardProps {
  template: EmailTemplate;
}

interface DocSectionProps {
  n: string;
  title: string;
  children: React.ReactNode;
}

interface DetailRowProps {
  label: string;
  value: string | number;
}

interface CodeProps {
  children: React.ReactNode;
}

interface CodeBlockProps {
  children: React.ReactNode;
}

// ── Components ──────────────────────────────────────────────────────

export function AdminGate({ onUnlock }: AdminGateProps) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authError = params.get('auth_error');
    if (authError) {
      const messages: Record<string, string> = {
        denied: 'Sign-in was cancelled.',
        not_authorized: 'That Google account isn\u2019t authorized as admin.',
        token_exchange: 'Google auth failed. Try again.',
        invalid_state: 'Session expired. Try again.',
        not_configured: 'Google OAuth isn\u2019t configured on the server.',
      };
      setError(messages[authError] || 'Something went wrong.');
      window.history.replaceState({}, '', window.location.pathname);
    }

    // Check if we just came back from a successful OAuth flow
    fetch('/api/auth/status')
      .then(r => r.json())
      .then((data: { isAdmin: boolean }) => {
        if (data.isAdmin) onUnlock();
      })
      .catch(() => {});
  }, [onUnlock]);

  return (
    <PaperSurface style={{ minHeight: '100%', padding: '80px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        maxWidth: 440,
        width: '100%',
        background: 'var(--linen)',
        border: '1.5px solid var(--umber-soft)',
        borderRadius: '20px 6px 20px 6px',
        padding: '38px 42px 34px',
        boxShadow: 'var(--shadow-lift)',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute',
          top: -14, left: 50,
          width: 90, height: 24,
          background: 'rgba(228,169,75,0.55)',
          border: '1px dashed rgba(122,62,42,0.3)',
          transform: 'rotate(-4deg)',
        }}/>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <HouseGlyph size={28}/>
          <span className="serif-display" style={{ fontSize: 16, fontWeight: 600 }}>Casa de Davin</span>
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.2em',
            textTransform: 'uppercase',
            padding: '3px 8px', marginLeft: 'auto',
            background: 'var(--umber)', color: 'var(--oat)',
            borderRadius: '6px 2px 6px 2px',
          }}>admin</span>
        </div>

        <SectionLabel>Staff entrance</SectionLabel>
        <h1 className="serif-display" style={{ fontSize: 40, lineHeight: 1, margin: '8px 0 8px', letterSpacing: '-0.02em' }}>
          Prove you&apos;re <span style={{ fontStyle: 'italic', color: 'var(--umber)' }}>me.</span>
        </h1>
        <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 15, color: 'var(--ink-soft)', margin: '0 0 22px' }}>
          Just a soft lock. If you&apos;re not Davin, close this tab, please and thank you.
        </p>

        <button
          onClick={() => { window.location.href = '/api/auth/google'; }}
          style={{
            width: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            padding: '12px 20px',
            background: '#fff',
            border: '1.5px solid var(--umber-soft)',
            borderRadius: '12px 4px 12px 4px',
            cursor: 'pointer',
            fontFamily: 'var(--sans)',
            fontSize: 15,
            fontWeight: 500,
            color: 'var(--ink)',
            transition: 'box-shadow 200ms ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-lift)')}
          onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 010-9.18l-7.98-6.19a24.08 24.08 0 000 21.56l7.98-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Sign in with Google
        </button>

        {error && (
          <div style={{ marginTop: 14, fontSize: 13, color: 'var(--terracotta-deep)', fontStyle: 'italic', fontFamily: 'var(--serif)' }}>
            {error}
          </div>
        )}
      </div>
    </PaperSurface>
  );
}

export function AboutPage({ onBack }: AboutPageProps) {
  const [stayCount, setStayCount] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then((data: { approvedStays?: number }) => {
        if (typeof data.approvedStays === 'number') setStayCount(data.approvedStays);
      })
      .catch(() => {});
  }, []);

  return (
    <PaperSurface style={{ minHeight: '100%', paddingBottom: 60 }}>
      <div style={{ padding: '22px 40px 10px', maxWidth: 980, margin: '0 auto' }}>
        <button onClick={onBack} style={{
          background: 'transparent', border: 'none', color: 'var(--umber)',
          fontFamily: 'var(--sans)', fontSize: 14, display: 'inline-flex',
          alignItems: 'center', gap: 6, cursor: 'pointer', padding: '6px 10px 6px 2px',
        }}>
          <ArrowLeft size={16}/> back to the house
        </button>
      </div>

      <div style={{ maxWidth: 980, margin: '0 auto', padding: '8px 40px 40px' }}>
        <SectionLabel>About your host</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 48, marginTop: 16, alignItems: 'flex-start' }}>
          <div>
            <h1 className="serif-display" style={{ fontSize: 80, lineHeight: 0.96, margin: '0 0 16px', letterSpacing: '-0.03em', fontWeight: 500 }}>
              Hi, I&apos;m <span style={{ fontStyle: 'italic', color: 'var(--umber)' }}>Davin.</span>
            </h1>
            <p style={{ fontFamily: 'var(--serif)', fontSize: 22, lineHeight: 1.5, color: 'var(--ink)', margin: '0 0 18px', fontStyle: 'italic' }}>
              I live in Denver-ish with too many plants, an embarrassingly good assortment of teas, and strong opinions about mugs.
            </p>
            <p style={{ fontFamily: 'var(--serif)', fontSize: 17, lineHeight: 1.65, color: 'var(--ink-soft)', margin: '0 0 14px' }}>
              This site exists because my friends kept texting me things like <em>&quot;hey am I still good for that weekend?&quot;</em> and I kept losing the threads. Now there&apos;s a form. You fill it out, I get an email, I drop it on my calendar, I reply. That&apos;s the whole thing.
            </p>
            <p style={{ fontFamily: 'var(--serif)', fontSize: 17, lineHeight: 1.65, color: 'var(--ink-soft)', margin: 0 }}>
              I am not running a business. I am, at best, running a small and poorly-lit hospitality theater.
            </p>
          </div>

          <div style={{
            background: 'var(--linen)',
            border: '1.5px solid var(--umber-soft)',
            borderRadius: '20px 6px 20px 6px',
            padding: '6px',
            overflow: 'hidden',
          }}>
            <img
              src="/davin.png"
              alt="Davin, your host"
              style={{
                width: '100%',
                height: 420,
                objectFit: 'cover',
                objectPosition: 'center top',
                borderRadius: '16px 4px 16px 4px',
                display: 'block',
              }}
            />
          </div>
        </div>

        <SprigDivider/>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28, marginTop: 28 }}>
          <FactBlock title="Location" big="Denver-ish, CO" sub="LoDo. Walk to coffee. Drive to mountains."/>
          <FactBlock title="Hosting since" big="2026" sub="Back when 'hosting' meant 'forgot you were coming, but sure.'"/>
          <FactBlock title="Stays to date" big={stayCount !== null ? String(stayCount) : '...'} sub="Zero have ended in estrangement. Close calls: two."/>
        </div>

        <SprigDivider/>

        <section style={{ marginTop: 28 }}>
          <h2 className="serif-display" style={{ fontSize: 38, margin: '0 0 14px', letterSpacing: '-0.02em', fontWeight: 500 }}>
            The full house rules.
          </h2>
          <p style={{ fontFamily: 'var(--serif)', fontSize: 15, color: 'var(--ink-soft)', fontStyle: 'italic', margin: '0 0 18px' }}>
            Less &quot;rules,&quot; more &quot;things that will happen either way, so we may as well agree on them.&quot;
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px 32px' }}>
            {([
              ['01', 'Shoes off at the door.', 'The floors are old and I am protective.'],
              ['02', 'Coffee is communal.', 'Beans in the freezer. Grinder on the counter. Help yourself.'],
              ['03', 'Plants are not decor.', 'They have names. Do not let Francine touch the window.'],
              ['04', 'No loud texting past 11pm.', "Yes that's a rule. Yes I'm serious. Sort of."],
              ['05', 'Close the damn door.', 'The heat bill agrees. So do the plants. So does the neighbor.'],
              ['06', 'Use the nice towels.', 'The other ones are aspirational.'],
              ['07', 'Leave the place funnier than you found it.', 'Note on the fridge. Weird magnet. Small mystery. Your call.'],
              ['08', 'Breakfast on Sundays.', 'Non-negotiable. Pancakes by default.'],
            ] as [string, string, string][]).map(([n, t, d]) => (
              <div key={n} style={{ display: 'grid', gridTemplateColumns: '44px 1fr', gap: 12 }}>
                <div style={{
                  fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--umber)',
                  letterSpacing: '0.1em',
                  borderTop: '1.5px solid var(--umber)',
                  paddingTop: 4, textAlign: 'right',
                }}>{n}</div>
                <div style={{ borderTop: '1.5px solid var(--umber)', paddingTop: 4 }}>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 500, marginBottom: 2 }}>{t}</div>
                  <div style={{ fontSize: 13, color: 'var(--ink-soft)', fontStyle: 'italic', lineHeight: 1.45 }}>{d}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <SprigDivider/>

        <section style={{ marginTop: 28 }}>
          <h2 className="serif-display" style={{ fontSize: 38, margin: '0 0 18px', letterSpacing: '-0.02em', fontWeight: 500 }}>
            FAQ, but small.
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {([
              ['Is there parking?', "Street parking, yes, usually."],
              ['Can I bring my dog?', "Depends on the dog. Send a picture. I'll judge and reply."],
              ['Is there wifi?', "Yes. The password is somewhere on the fridge under a magnet shaped like a pickle."],
              ['Do you have a guest key?', "There's a door code — I'll send it to you before you arrive."],
              ["What if I'm allergic to plants?", "Then this may not be your Casa. I'm sorry."],
            ] as [string, string][]).map(([q, a]) => (
              <details key={q} style={{
                borderBottom: '1px dashed var(--umber-soft)',
                paddingBottom: 14,
              }}>
                <summary style={{
                  fontFamily: 'var(--serif)', fontSize: 19, fontWeight: 500,
                  cursor: 'pointer', color: 'var(--ink)',
                  listStyle: 'none',
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <span style={{ color: 'var(--umber)', fontFamily: 'var(--mono)', fontSize: 14 }}>&rarr;</span>
                  {q}
                </summary>
                <div style={{ marginTop: 8, fontFamily: 'var(--serif)', fontSize: 15, color: 'var(--ink-soft)', fontStyle: 'italic', lineHeight: 1.55, paddingLeft: 26 }}>
                  {a}
                </div>
              </details>
            ))}
          </div>
        </section>
      </div>
    </PaperSurface>
  );
}

function PlaceholderImage({ label, height = 220 }: PlaceholderImageProps) {
  return (
    <div style={{
      height,
      background: 'repeating-linear-gradient(135deg, var(--oat-deep) 0 12px, var(--linen) 12px 24px)',
      border: '1.5px dashed var(--umber-soft)',
      borderRadius: '14px 4px 14px 4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--umber)',
      fontFamily: 'var(--mono)',
      fontSize: 12,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      textAlign: 'center',
      padding: 14,
    }}>
      [ {label} ]
    </div>
  );
}

function FactBlock({ title, big, sub }: FactBlockProps) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--umber)', marginBottom: 6 }}>{title}</div>
      <div className="serif-display" style={{ fontSize: 26, fontWeight: 500, color: 'var(--ink)', lineHeight: 1.1, marginBottom: 4 }}>{big}</div>
      <div style={{ fontSize: 13, color: 'var(--ink-soft)', fontStyle: 'italic', fontFamily: 'var(--serif)', lineHeight: 1.45 }}>{sub}</div>
    </div>
  );
}

interface GuestbookApiEntry {
  id: string;
  guestName: string;
  room: string;
  rating: number;
  title: string;
  body: string;
  signoff: string;
  imageUrls: string[];
  createdAt: string;
}

export function Guestbook({ onBack }: GuestbookProps) {
  const [filter, setFilter] = useState<string>('all');
  const [entries, setEntries] = useState<GuestbookApiEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetch('/api/guestbook')
      .then(r => r.json())
      .then((data: { ok: boolean; entries?: GuestbookApiEntry[] }) => {
        if (data.ok && data.entries) setEntries(data.entries);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? entries : entries.filter(e => e.room === filter);

  return (
    <PaperSurface style={{ minHeight: '100%', paddingBottom: 60 }}>
      <div style={{ padding: '22px 40px 10px', maxWidth: 1100, margin: '0 auto' }}>
        <button onClick={onBack} style={{
          background: 'transparent', border: 'none', color: 'var(--umber)',
          fontFamily: 'var(--sans)', fontSize: 14, display: 'inline-flex',
          alignItems: 'center', gap: 6, cursor: 'pointer', padding: '6px 10px 6px 2px',
        }}>
          <ArrowLeft size={16}/> back to the house
        </button>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '8px 40px 40px' }}>
        <SectionLabel>The guestbook</SectionLabel>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 20, flexWrap: 'wrap', marginTop: 10, marginBottom: 26 }}>
          <h1 className="serif-display" style={{ fontSize: 76, lineHeight: 0.96, margin: 0, letterSpacing: '-0.03em', fontWeight: 500 }}>
            What guests<br/>
            <span style={{ fontStyle: 'italic', color: 'var(--umber)' }}>actually said.</span>
          </h1>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['all', 'couch', 'bedroom'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  style={{
                    padding: '6px 14px',
                    fontSize: 13,
                    fontFamily: 'var(--sans)',
                    textTransform: 'capitalize',
                    background: filter === f ? 'var(--moss)' : 'transparent',
                    color: filter === f ? 'var(--oat)' : 'var(--ink)',
                    border: filter === f ? '1.5px solid var(--moss-dark)' : '1.5px dashed var(--umber-soft)',
                    borderRadius: '10px 4px 10px 4px',
                    cursor: 'pointer',
                  }}>{f}</button>
              ))}
            </div>
            <MossButton onClick={() => setShowForm(!showForm)} variant="secondary" size="sm">
              {showForm ? 'Close form' : 'Leave a review'}
            </MossButton>
          </div>
        </div>

        {showForm && (
          <ReviewForm onSubmitted={() => {
            setShowForm(false);
            // Re-fetch after submission (will show after admin approves)
            fetch('/api/guestbook')
              .then(r => r.json())
              .then((data: { ok: boolean; entries?: GuestbookApiEntry[] }) => {
                if (data.ok && data.entries) setEntries(data.entries);
              })
              .catch(() => {});
          }} />
        )}

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--ink-soft)' }}>
            Loading...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--ink-soft)' }}>
            {entries.length === 0
              ? 'No reviews yet. Be the first — if you dare.'
              : 'Nothing for this filter.'}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px 24px' }}>
            {filtered.map((e, i) => (
              <GuestCard key={e.id} entry={e} rot={ROTS[i % ROTS.length]}/>
            ))}
          </div>
        )}
      </div>
    </PaperSurface>
  );
}

const ROTS = [-1.2, 1.4, -0.8, 1.1, 0.5, -1.6, 0.9, -0.4];

function ReviewForm({ onSubmitted }: { onSubmitted: () => void }) {
  const [ref, setRef] = useState('');
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [signoff, setSignoff] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePhotos = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files).slice(0, 4);
    setPhotos(arr);
    setPreviews(arr.map(f => URL.createObjectURL(f)));
  };

  const removePhoto = (idx: number) => {
    setPhotos(p => p.filter((_, i) => i !== idx));
    setPreviews(p => { URL.revokeObjectURL(p[idx]); return p.filter((_, i) => i !== idx); });
  };

  const submit = async () => {
    if (!ref.trim() || !title.trim() || !body.trim()) {
      setError('Booking ref, title, and review are required.');
      return;
    }
    setSubmitting(true);
    setError(null);

    const fd = new FormData();
    fd.append('bookingRef', ref.trim().toUpperCase());
    fd.append('rating', String(rating));
    fd.append('title', title.trim());
    fd.append('body', body.trim());
    fd.append('signoff', signoff.trim());
    for (const photo of photos) {
      fd.append('photos', photo);
    }

    try {
      const res = await fetch('/api/guestbook', { method: 'POST', body: fd });
      const data = await res.json() as { ok: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error || 'Something went wrong.');
        setSubmitting(false);
        return;
      }
      setSuccess(true);
      setTimeout(onSubmitted, 2000);
    } catch {
      setError('Network error.');
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div style={{
        marginBottom: 30, padding: '24px 28px',
        background: 'rgba(90,125,58,0.08)',
        border: '1.5px dashed var(--moss)',
        borderRadius: '16px 6px 16px 6px',
        textAlign: 'center',
      }}>
        <div className="serif-display" style={{ fontSize: 24, color: 'var(--moss)', marginBottom: 6 }}>Review submitted!</div>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 14, color: 'var(--ink-soft)', fontStyle: 'italic' }}>
          It&apos;ll show up once Davin reads it and pretends he wasn&apos;t moved.
        </div>
      </div>
    );
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    fontSize: 14,
    fontFamily: 'var(--sans)',
    background: 'rgba(242,234,216,0.6)',
    border: '1.5px dashed var(--umber-soft)',
    borderRadius: '10px 4px 10px 4px',
    color: 'var(--ink)',
    outline: 'none',
  };

  return (
    <div style={{
      marginBottom: 30, padding: '24px 28px',
      background: 'var(--linen)',
      border: '1.5px solid var(--umber-soft)',
      borderRadius: '16px 6px 16px 6px',
    }}>
      <SectionLabel>Leave a review</SectionLabel>
      <p style={{ fontFamily: 'var(--serif)', fontSize: 14, color: 'var(--ink-soft)', fontStyle: 'italic', margin: '4px 0 18px' }}>
        You&apos;ll need your booking ref (CDD-XXXXX) from your confirmation. Only approved guests can review.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        <div>
          <label style={labelStyle}>Booking ref</label>
          <input value={ref} onChange={e => setRef(e.target.value)} placeholder="CDD-12345" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Rating</label>
          <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} onClick={() => setRating(n)} style={{
                width: 36, height: 36,
                borderRadius: '8px 3px 8px 3px',
                border: rating >= n ? '1.5px solid var(--honey)' : '1.5px dashed var(--umber-soft)',
                background: rating >= n ? 'var(--honey)' : 'transparent',
                color: rating >= n ? 'var(--oat)' : 'var(--ink-soft)',
                fontSize: 16, fontWeight: 600,
                cursor: 'pointer',
              }}>{n}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Title</label>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Sum it up in a sentence" style={inputStyle} />
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Your review</label>
        <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Be honest. Or at least entertainingly dishonest." rows={4}
          style={{ ...inputStyle, resize: 'vertical', fontFamily: 'var(--serif)' }} />
      </div>

      <div style={{ marginBottom: 14 }}>
        <label style={labelStyle}>Sign-off (optional)</label>
        <input value={signoff} onChange={e => setSignoff(e.target.value)} placeholder="e.g. Would come back. Probably." style={inputStyle} />
      </div>

      {/* Photo upload */}
      <div style={{ marginBottom: 18 }}>
        <label style={labelStyle}>Photos (optional, up to 4)</label>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          onChange={e => handlePhotos(e.target.files)}
          style={{ display: 'none' }}
        />
        <div style={{ display: 'flex', gap: 10, marginTop: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          {previews.map((src, i) => (
            <div key={i} style={{ position: 'relative', width: 72, height: 72 }}>
              <img src={src} alt="" style={{
                width: 72, height: 72, objectFit: 'cover',
                borderRadius: '8px 3px 8px 3px',
                border: '1.5px solid var(--umber-soft)',
              }} />
              <button onClick={() => removePhoto(i)} style={{
                position: 'absolute', top: -6, right: -6,
                width: 20, height: 20,
                borderRadius: 10,
                background: 'var(--terracotta)',
                color: 'var(--oat)',
                border: 'none',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>×</button>
            </div>
          ))}
          {photos.length < 4 && (
            <button onClick={() => fileRef.current?.click()} style={{
              width: 72, height: 72,
              borderRadius: '8px 3px 8px 3px',
              border: '1.5px dashed var(--umber-soft)',
              background: 'rgba(242,234,216,0.5)',
              color: 'var(--umber)',
              fontSize: 24,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>+</button>
          )}
        </div>
      </div>

      {error && (
        <div style={{ marginBottom: 14, padding: '10px 14px', background: 'rgba(201,123,94,0.12)', border: '1px dashed var(--terracotta)', borderRadius: '8px 3px 8px 3px', fontSize: 13, color: 'var(--terracotta)' }}>
          {error}
        </div>
      )}

      <MossButton onClick={submit} disabled={submitting} size="md">
        {submitting ? 'Submitting...' : 'Submit review'}
      </MossButton>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: 'var(--umber)',
  marginBottom: 4,
};

function GuestCard({ entry, rot }: { entry: GuestbookApiEntry; rot: number }) {
  const dateFmt = new Date(entry.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  return (
    <div style={{
      background: 'var(--linen)',
      border: '1.5px solid var(--umber-soft)',
      borderRadius: '16px 6px 16px 6px',
      padding: '20px 22px 22px',
      position: 'relative',
      transform: `rotate(${rot}deg)`,
      boxShadow: 'var(--shadow-soft)',
    }}>
      <div style={{
        position: 'absolute',
        top: -10, right: 20,
        width: 54, height: 18,
        background: 'rgba(228,169,75,0.55)',
        border: '1px dashed rgba(122,62,42,0.3)',
        transform: 'rotate(8deg)',
      }}/>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <SunRating value={entry.rating} size={14}/>
        <span style={{
          fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase',
          color: 'var(--umber)', background: 'rgba(228,169,75,0.3)',
          padding: '3px 8px', borderRadius: '6px 2px 6px 2px',
        }}>
          {entry.room === 'couch' ? 'the couch' : 'the bedroom'}
        </span>
      </div>

      <h3 className="serif-display" style={{ fontSize: 22, fontWeight: 500, lineHeight: 1.15, margin: '0 0 10px', letterSpacing: '-0.01em' }}>
        &quot;{entry.title}&quot;
      </h3>

      <p style={{ fontFamily: 'var(--serif)', fontSize: 14, lineHeight: 1.55, color: 'var(--ink-soft)', margin: '0 0 14px' }}>
        {entry.body}
      </p>

      {/* Photos */}
      {entry.imageUrls.length > 0 && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
          {entry.imageUrls.map((url, i) => (
            <img key={i} src={url} alt={`Photo by ${entry.guestName}`} style={{
              width: 80, height: 80, objectFit: 'cover',
              borderRadius: '8px 3px 8px 3px',
              border: '1px solid var(--umber-soft)',
            }} />
          ))}
        </div>
      )}

      <div style={{ borderTop: '1px dashed var(--umber-soft)', paddingTop: 10 }}>
        <div className="hand" style={{ fontSize: 22, color: 'var(--umber)', marginBottom: 2 }}>
          &mdash; {entry.guestName}
        </div>
        <div style={{ fontSize: 11, color: 'var(--ink-soft)', fontStyle: 'italic', fontFamily: 'var(--serif)' }}>
          {dateFmt}{entry.signoff ? ` · ${entry.signoff}` : ''}
        </div>
      </div>
    </div>
  );
}

export function ErrorScreen({ onRetry, onHome }: ErrorScreenProps) {
  return (
    <PaperSurface style={{ minHeight: '100%', padding: '100px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        maxWidth: 520,
        textAlign: 'center',
        background: 'var(--linen)',
        border: '1.5px solid var(--umber-soft)',
        borderRadius: '20px 6px 20px 6px',
        padding: '48px 42px 40px',
        transform: 'rotate(-1deg)',
        boxShadow: 'var(--shadow-lift)',
      }}>
        <div style={{ fontSize: 64, marginBottom: 6, fontFamily: 'var(--serif)', color: 'var(--umber)' }}>
          {'¯\\_(ツ)_/¯'}
        </div>
        <SectionLabel>Error 500-ish</SectionLabel>
        <h1 className="serif-display" style={{ fontSize: 48, lineHeight: 1, margin: '10px 0 12px', letterSpacing: '-0.02em', fontWeight: 500 }}>
          Something <span style={{ fontStyle: 'italic', color: 'var(--umber)' }}>broke.</span>
        </h1>
        <p style={{ fontFamily: 'var(--serif)', fontSize: 18, fontStyle: 'italic', color: 'var(--ink-soft)', margin: '0 0 22px', lineHeight: 1.5 }}>
          Probably the Wi-Fi. Almost certainly the Wi-Fi. Try again?
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <MossButton onClick={onRetry}>Try again</MossButton>
          <MossButton onClick={onHome} variant="secondary">Back to safety</MossButton>
        </div>
        <div className="hand" style={{ marginTop: 18, fontSize: 18, color: 'var(--umber-soft)' }}>
          I promise I didn&apos;t do it on purpose.
        </div>
      </div>
    </PaperSurface>
  );
}

export function SharePage({ onBack, booking }: SharePageProps) {
  const fake: ShareBooking = booking || {
    name: 'You',
    room: 'bedroom',
    dates: 'Jun 14 → Jun 17',
    nights: 3,
    why: 'Bringing the good olive oil.',
    submitted: 'just now',
    ref: 'CDD-00042',
  };
  const ref = fake.ref || ('CDD-' + Math.floor(Math.random() * 90000 + 10000));

  return (
    <PaperSurface style={{ minHeight: '100%', padding: '40px 20px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <button onClick={onBack} style={{
          background: 'transparent', border: 'none', color: 'var(--umber)',
          fontFamily: 'var(--sans)', fontSize: 14, display: 'inline-flex',
          alignItems: 'center', gap: 6, cursor: 'pointer', padding: '6px 10px 6px 2px', marginBottom: 14,
        }}>
          <ArrowLeft size={16}/> back to the house
        </button>

        <SectionLabel>Your submission</SectionLabel>
        <h1 className="serif-display" style={{ fontSize: 54, lineHeight: 1, margin: '8px 0 18px', letterSpacing: '-0.02em', fontWeight: 500 }}>
          Receipt for<br/>
          <span style={{ fontStyle: 'italic', color: 'var(--umber)' }}>your plea.</span>
        </h1>

        <div style={{
          background: 'var(--linen)',
          border: '1.5px solid var(--umber-soft)',
          borderRadius: '20px 6px 20px 6px',
          padding: '32px 36px 28px',
          position: 'relative',
          boxShadow: 'var(--shadow-lift)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--umber)' }}>Reference</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 18, marginTop: 3 }}>{ref}</div>
            </div>
            <div style={{
              padding: '4px 10px',
              background: 'var(--honey)',
              borderRadius: '8px 3px 8px 3px',
              fontSize: 10, fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--ink)',
            }}>pending</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px', marginBottom: 20 }}>
            <DetailRow label="Name" value={fake.name}/>
            <DetailRow label="Room" value={fake.room === 'couch' ? 'The Couch' : 'The Bedroom'}/>
            <DetailRow label="Dates" value={fake.dates || 'TBD'}/>
            <DetailRow label="Nights" value={fake.nights || '—'}/>
          </div>

          <div style={{
            padding: '12px 14px',
            background: 'rgba(242,234,216,0.6)',
            border: '1px dashed var(--umber-soft)',
            borderRadius: '10px 4px 10px 4px',
            fontFamily: 'var(--serif)',
            fontStyle: 'italic',
            fontSize: 15,
            color: 'var(--ink)',
            lineHeight: 1.5,
          }}>
            &quot;{fake.why}&quot;
          </div>

          <SprigDivider/>

          <div style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.6, fontFamily: 'var(--serif)' }}>
            Share this link with Davin if he asks &quot;wait, did you already send that?&quot; He will. He always does.
          </div>

          <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button style={copyBtn} onClick={() => navigator.clipboard?.writeText(`casadedavin.house/r/${ref}`)}>
              📋 Copy share link
            </button>
            <button style={copyBtn}>
              📅 Add to my calendar
            </button>
          </div>
        </div>
      </div>
    </PaperSurface>
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

const copyBtn: React.CSSProperties = {
  padding: '8px 14px',
  background: 'transparent',
  border: '1.5px dashed var(--umber-soft)',
  borderRadius: '10px 3px 10px 3px',
  fontSize: 13,
  color: 'var(--ink)',
  cursor: 'pointer',
  fontFamily: 'var(--sans)',
};

const EMAIL_TEMPLATES: Record<string, EmailTemplate> = {
  approve: {
    subject: "ok fine, you can stay",
    from: "Davin <me@casadedavin.house>",
    to: "kevin@example.com",
    preview: "I'm putting this on the calendar. Bring the good olive oil.",
    greeting: "Kevin —",
    body: [
      "Ok you're in.",
      "I put you on the bedroom for June 14–17. Key situation: I'll text you the day before. Don't lose it, I only have two.",
      "Bring the good olive oil like you said. I will know if it is the bad olive oil.",
    ],
    signoff: "— D",
    cta: "Add to your calendar",
  },
  decline: {
    subject: "sadly, no",
    from: "Davin <me@casadedavin.house>",
    to: "leo@example.com",
    preview: "Those dates don't work — let's try another weekend.",
    greeting: "Leo —",
    body: [
      "I can't make those dates work. Not a vibe thing, just a calendar thing.",
      "Pick any of these and I'll hold it: July 19–21, Aug 2–4, or literally any random Tuesday.",
      "Sorry about the couch. I know how fond of it you were.",
    ],
    signoff: "— D",
    cta: "Pick another weekend",
  },
  nudge: {
    subject: "hey so, the plea was sparse",
    from: "Davin <me@casadedavin.house>",
    to: "mystery@example.com",
    preview: "'just vibes tbh' is not, technically, a reason.",
    greeting: "Friend —",
    body: [
      "Your message was 'just vibes tbh'.",
      "I respect the economy. I'm going to need slightly more than that, though.",
      "Reply with why, ideally, and I'll get back to you. If you can work in a weirdly specific compliment in a way that isn't a lie, even better.",
    ],
    signoff: "— D, the gatekeeper",
    cta: "Write something less sparse",
  },
};

export function EmailPreviews({ onBack }: EmailPreviewsProps) {
  const [which, setWhich] = useState<string>('approve');
  return (
    <PaperSurface style={{ minHeight: '100%', paddingBottom: 60 }}>
      <div style={{ padding: '22px 40px 10px', maxWidth: 1060, margin: '0 auto' }}>
        <button onClick={onBack} style={{
          background: 'transparent', border: 'none', color: 'var(--umber)',
          fontFamily: 'var(--sans)', fontSize: 14, display: 'inline-flex',
          alignItems: 'center', gap: 6, cursor: 'pointer', padding: '6px 10px 6px 2px',
        }}>
          <ArrowLeft size={16}/> back to the house
        </button>
      </div>
      <div style={{ maxWidth: 1060, margin: '0 auto', padding: '8px 40px 40px' }}>
        <SectionLabel>Email templates</SectionLabel>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
          <h1 className="serif-display" style={{ fontSize: 58, lineHeight: 0.96, margin: 0, letterSpacing: '-0.02em', fontWeight: 500 }}>
            The replies<br/>
            <span style={{ fontStyle: 'italic', color: 'var(--umber)' }}>Davin sends.</span>
          </h1>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['approve', 'decline', 'nudge'] as const).map(k => (
              <button key={k} onClick={() => setWhich(k)}
                style={{
                  padding: '7px 14px', fontSize: 13,
                  background: which === k ? 'var(--moss)' : 'transparent',
                  color: which === k ? 'var(--oat)' : 'var(--ink)',
                  border: which === k ? '1.5px solid var(--moss-dark)' : '1.5px dashed var(--umber-soft)',
                  borderRadius: '10px 4px 10px 4px',
                  cursor: 'pointer', textTransform: 'capitalize',
                  fontFamily: 'var(--sans)',
                }}>{k}</button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 32, alignItems: 'flex-start' }}>
          <EmailCard template={EMAIL_TEMPLATES[which]}/>
          <aside style={{
            background: 'var(--linen)',
            border: '1.5px dashed var(--umber-soft)',
            borderRadius: '16px 6px 16px 6px',
            padding: '18px 20px',
            position: 'sticky', top: 20,
          }}>
            <SectionLabel>Sending via</SectionLabel>
            <ul style={{ margin: '10px 0 0', padding: 0, listStyle: 'none', fontSize: 14, fontFamily: 'var(--serif)', lineHeight: 1.7, color: 'var(--ink)' }}>
              <li>&bull; Resend (transactional)</li>
              <li>&bull; From: <code style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>me@casadedavin.house</code></li>
              <li>&bull; Reply-to: Davin&apos;s personal</li>
              <li>&bull; Plain text fallback included</li>
            </ul>
            <div className="hand" style={{ marginTop: 14, fontSize: 18, color: 'var(--umber-soft)' }}>
              no unsubscribe button, it&apos;s just me
            </div>
          </aside>
        </div>
      </div>
    </PaperSurface>
  );
}

function EmailCard({ template }: EmailCardProps) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid rgba(122,62,42,0.25)',
      borderRadius: '12px 4px 12px 4px',
      overflow: 'hidden',
      boxShadow: '0 20px 40px -16px rgba(43,53,36,0.25)',
    }}>
      <div style={{
        padding: '10px 16px',
        borderBottom: '1px solid rgba(122,62,42,0.15)',
        fontFamily: 'var(--sans)',
        fontSize: 11,
        color: '#6b6b6b',
        background: '#faf8f4',
        display: 'flex', justifyContent: 'space-between',
      }}>
        <span>Gmail &middot; Primary</span>
        <span>Today &middot; 2:04 PM</span>
      </div>
      <div style={{ padding: '20px 26px 14px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '4px 14px', fontSize: 13, color: '#444', marginBottom: 14 }}>
          <div style={{ fontWeight: 600 }}>From:</div><div>{template.from}</div>
          <div style={{ fontWeight: 600 }}>To:</div><div>{template.to}</div>
          <div style={{ fontWeight: 600 }}>Subject:</div><div style={{ fontWeight: 600, color: '#111' }}>{template.subject}</div>
        </div>
      </div>
      <div style={{
        padding: '4px 30px 30px',
        fontFamily: 'var(--serif)',
        fontSize: 16,
        lineHeight: 1.65,
        color: '#222',
      }}>
        <div style={{ marginBottom: 16 }}>{template.greeting}</div>
        {template.body.map((p, i) => (
          <p key={i} style={{ margin: '0 0 14px' }}>{p}</p>
        ))}
        <div style={{ margin: '18px 0 14px' }}>
          <button style={{
            background: 'var(--moss)',
            color: '#fff',
            border: 'none',
            padding: '10px 18px',
            borderRadius: 6,
            fontSize: 14,
            fontFamily: 'var(--sans)',
            fontWeight: 500,
            cursor: 'pointer',
          }}>{template.cta}</button>
        </div>
        <div style={{ marginTop: 20 }}>{template.signoff}</div>
      </div>
      <div style={{
        padding: '10px 26px 16px',
        borderTop: '1px solid rgba(122,62,42,0.12)',
        fontSize: 10,
        color: '#999',
        fontFamily: 'var(--sans)',
      }}>
        Casa de Davin &middot; Denver-ish, CO &middot; Not a business, just a person.
      </div>
    </div>
  );
}

export function HandoffDoc({ onBack }: HandoffDocProps) {
  return (
    <PaperSurface style={{ minHeight: '100%', paddingBottom: 60 }}>
      <div style={{ padding: '22px 40px 10px', maxWidth: 880, margin: '0 auto' }}>
        <button onClick={onBack} style={{
          background: 'transparent', border: 'none', color: 'var(--umber)',
          fontFamily: 'var(--sans)', fontSize: 14, display: 'inline-flex',
          alignItems: 'center', gap: 6, cursor: 'pointer', padding: '6px 10px 6px 2px',
        }}>
          <ArrowLeft size={16}/> back to the house
        </button>
      </div>
      <div style={{ maxWidth: 880, margin: '0 auto', padding: '8px 40px 40px' }}>
        <SectionLabel>Backend handoff</SectionLabel>
        <h1 className="serif-display" style={{ fontSize: 54, lineHeight: 1, margin: '8px 0 12px', letterSpacing: '-0.02em', fontWeight: 500 }}>
          The <span style={{ fontStyle: 'italic', color: 'var(--umber)' }}>boring</span> part.
        </h1>
        <p style={{ fontFamily: 'var(--serif)', fontSize: 17, color: 'var(--ink-soft)', fontStyle: 'italic', margin: '0 0 28px', lineHeight: 1.55 }}>
          Notes for whoever wires this up. (Probably Davin, at 11pm, with a beer.)
        </p>

        <DocSection n="01" title="Form → Calendar">
          <p>On form submit, POST <Code>/api/book</Code> with:</p>
          <CodeBlock>{`{
  "name": "Kevin Ahn",
  "room": "bedroom",
  "arrive": "2026-06-14",
  "depart": "2026-06-17",
  "why": "bringing good olive oil",
  "travel": "flight sat morning"
}`}</CodeBlock>
          <p>Server creates a <strong>tentative</strong> Google Calendar event on Davin&apos;s primary calendar.</p>
        </DocSection>

        <DocSection n="02" title="Form → Email">
          <p>Same submit also sends Davin a transactional email via Resend.</p>
        </DocSection>

        <DocSection n="03" title="No database, on purpose">
          <p>Bookings live entirely in Google Calendar. Admin view reads from the Calendar API with a 30s cache.</p>
        </DocSection>

        <DocSection n="04" title="Env vars">
          <CodeBlock>{`GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REFRESH_TOKEN=...
GOOGLE_CALENDAR_ID=primary

RESEND_API_KEY=re_...
MAIL_FROM="Davin <me@casadedavin.house>"
MAIL_TO=davin@personal.example

ADMIN_PASSWORD=sincerely
SESSION_SECRET=...`}</CodeBlock>
        </DocSection>

        <DocSection n="05" title="Rate limiting">
          <p>One submission per IP per minute.</p>
        </DocSection>

        <DocSection n="06" title="What's deliberately missing">
          <ul>
            <li>No user accounts.</li>
            <li>No payment.</li>
            <li>No reviews feature.</li>
            <li>No analytics.</li>
          </ul>
        </DocSection>
      </div>
    </PaperSurface>
  );
}

function DocSection({ n, title, children }: DocSectionProps) {
  return (
    <section style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 10, borderTop: '1.5px solid var(--umber)', paddingTop: 10 }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--umber)', letterSpacing: '0.1em' }}>{n}</div>
        <h2 className="serif-display" style={{ fontSize: 26, margin: 0, letterSpacing: '-0.01em', fontWeight: 500 }}>{title}</h2>
      </div>
      <div style={{ fontFamily: 'var(--serif)', fontSize: 16, lineHeight: 1.65, color: 'var(--ink)' }}>
        {children}
      </div>
    </section>
  );
}

function Code({ children }: CodeProps) {
  return <code style={{ fontFamily: 'var(--mono)', fontSize: 13, background: 'rgba(228,169,75,0.18)', padding: '1px 6px', borderRadius: 4, color: 'var(--umber)' }}>{children}</code>;
}
function CodeBlock({ children }: CodeBlockProps) {
  return (
    <pre style={{
      fontFamily: 'var(--mono)', fontSize: 12,
      background: 'rgba(43,53,36,0.92)',
      color: '#e8dfc4',
      padding: '14px 18px',
      borderRadius: '10px 4px 10px 4px',
      overflow: 'auto',
      lineHeight: 1.55,
      margin: '12px 0',
    }}>{children}</pre>
  );
}

export function GuestGate({ onUnlock, onCancel, room }: GuestGateProps) {
  const [pw, setPw] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<number>(0);

  const hints: string[] = [
    "Hint: it's the first word of my favorite kava bar.",
    "Hint: Sincerely ___ Kava Bar.",
    "Hint: it's how you end a letter you kind of mean.",
    "Hint: fine. It's 'sincerely'. Please type 'sincerely'.",
  ];

  const submit = (e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (pw.trim().toLowerCase() === 'sincerely') {
      onUnlock();
    } else {
      setAttempts(a => a + 1);
      setError("Wrong. Ask Davin. He'll tell you, probably.");
      setPw('');
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(20, 15, 10, 0.72)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: 20,
      animation: 'fade-up 180ms ease',
    }}
      onClick={onCancel}
    >
      <div onClick={(e) => e.stopPropagation()} style={{
        maxWidth: 440,
        width: '100%',
        background: 'var(--linen)',
        border: '1.5px solid var(--umber-soft)',
        borderRadius: '20px 6px 20px 6px',
        padding: '38px 42px 34px',
        boxShadow: '0 40px 80px -20px rgba(0,0,0,0.6)',
        position: 'relative',
        transform: 'rotate(-0.6deg)',
      }}>
        <button onClick={onCancel} style={{
          position: 'absolute', top: 14, right: 14,
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: 'var(--umber)', padding: 4,
        }}><XIcon size={18}/></button>

        <div style={{
          position: 'absolute',
          top: -14, left: 40,
          width: 90, height: 24,
          background: 'rgba(228,169,75,0.55)',
          border: '1px dashed rgba(122,62,42,0.3)',
          transform: 'rotate(-4deg)',
        }}/>

        <SectionLabel>Friends-only door</SectionLabel>
        <h2 className="serif-display" style={{ fontSize: 36, lineHeight: 1, margin: '8px 0 8px', letterSpacing: '-0.02em', fontWeight: 500 }}>
          Before you <span style={{ fontStyle: 'italic', color: 'var(--umber)' }}>book</span>&hellip;
        </h2>
        <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 15, color: 'var(--ink-soft)', margin: '0 0 22px', lineHeight: 1.5 }}>
          You need the word. If you don&apos;t have it, text me and I&apos;ll give it to you. {room === 'couch' ? 'The couch waits.' : room === 'bedroom' ? 'The bedroom waits.' : 'A room waits.'}
        </p>

        <form onSubmit={submit}>
          <div style={{ marginBottom: 6, fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--umber)' }}>
            The word
          </div>
          <input
            type="password"
            value={pw}
            onChange={(e) => { setPw(e.target.value); setError(null); }}
            autoFocus
            placeholder="say the word"
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              borderBottom: `1.5px dashed ${error ? 'var(--terracotta-deep)' : 'var(--umber-soft)'}`,
              padding: '8px 2px',
              fontFamily: 'var(--serif)',
              fontSize: 20,
              color: 'var(--ink)',
              outline: 'none',
            }}
          />
          {error && (
            <div style={{ marginTop: 8, fontSize: 13, color: 'var(--terracotta-deep)', fontStyle: 'italic', fontFamily: 'var(--serif)' }}>
              {error}
            </div>
          )}
          {attempts > 0 && (
            <div className="hand" style={{ marginTop: 10, fontSize: 18, color: 'var(--umber-soft)' }}>
              {hints[Math.min(attempts - 1, hints.length - 1)]}
            </div>
          )}
          <div style={{ marginTop: 22, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <MossButton type="submit" size="md" onClick={submit}>
              Let me book <ArrowRight size={14}/>
            </MossButton>
            <button type="button" onClick={onCancel} style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--ink-soft)',
              fontFamily: 'var(--sans)',
              fontSize: 13,
              cursor: 'pointer',
              padding: '8px 6px',
            }}>
              never mind
            </button>
          </div>
        </form>

        <div style={{ marginTop: 18, fontSize: 11, color: 'var(--ink-soft)', fontStyle: 'italic', opacity: 0.75, borderTop: '1px dashed var(--umber-soft)', paddingTop: 12, lineHeight: 1.5 }}>
          You only need to say it once. After that the door remembers you.
        </div>
      </div>
    </div>
  );
}
