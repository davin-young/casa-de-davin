import { Resend } from 'resend';

// ── Interfaces ──────────────────────────────────────────────────────

export interface BookingEmailData {
  name: string;
  room: 'couch' | 'bedroom';
  arrive: string;
  depart: string;
  why: string;
  travel: string;
  ref: string;
}

interface EmailConfig {
  from: string;
  to: string;
}

// ── Client ──────────────────────────────────────────────────────────

function getResend(): Resend {
  return new Resend(process.env.RESEND_API_KEY);
}

function getConfig(): EmailConfig {
  return {
    from: process.env.MAIL_FROM || 'Casa de Davin <noreply@casadedavin.house>',
    to: process.env.MAIL_TO || '',
  };
}

function nightCount(arrive: string, depart: string): number {
  return Math.round((new Date(depart).getTime() - new Date(arrive).getTime()) / 86_400_000);
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ── Notification to Davin ───────────────────────────────────────────

export async function sendBookingNotification(data: BookingEmailData): Promise<void> {
  const resend = getResend();
  const config = getConfig();
  const nights = nightCount(data.arrive, data.depart);
  const roomLabel = data.room === 'couch' ? 'the couch' : 'the bedroom';

  await resend.emails.send({
    from: config.from,
    to: config.to,
    subject: `new plea — ${data.name} wants ${roomLabel}`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 520px; color: #2b3524; line-height: 1.6;">
        <p style="font-size: 18px; margin: 0 0 16px;">
          <strong>${data.name}</strong> &middot; ${roomLabel} &middot;
          ${fmtDate(data.arrive)} &rarr; ${fmtDate(data.depart)} (${nights} night${nights !== 1 ? 's' : ''})
        </p>
        <p style="margin: 0 0 8px; color: #3d4a33;">
          <em>Why:</em> &ldquo;${data.why}&rdquo;
        </p>
        ${data.travel ? `<p style="margin: 0 0 8px; color: #3d4a33;"><em>Travel:</em> ${data.travel}</p>` : ''}
        <hr style="border: none; border-top: 1px dashed #9b5a42; margin: 20px 0;" />
        <p style="font-size: 13px; color: #9b5a42;">
          Ref: ${data.ref}<br/>
          <a href="https://casadedavin.house/admin" style="color: #5a7d3a;">Open admin panel</a>
        </p>
      </div>
    `,
    text: [
      `${data.name} · ${roomLabel} · ${fmtDate(data.arrive)} → ${fmtDate(data.depart)} (${nights} nights)`,
      `Why: "${data.why}"`,
      data.travel ? `Travel: ${data.travel}` : '',
      `Ref: ${data.ref}`,
    ].filter(Boolean).join('\n'),
  });
}

// ── Approval email to guest ─────────────────────────────────────────

export async function sendApprovalEmail(data: BookingEmailData, guestEmail: string): Promise<void> {
  const resend = getResend();
  const config = getConfig();
  const roomLabel = data.room === 'couch' ? 'the couch' : 'the bedroom';

  await resend.emails.send({
    from: config.from,
    to: guestEmail,
    replyTo: config.to,
    subject: 'ok fine, you can stay',
    html: `
      <div style="font-family: Georgia, serif; max-width: 520px; color: #2b3524; line-height: 1.6;">
        <p>${data.name} &mdash;</p>
        <p>Ok you're in.</p>
        <p>I put you on ${roomLabel} for ${fmtDate(data.arrive)}&ndash;${fmtDate(data.depart)}.
        Key situation: I'll text you the day before. Don't lose it, I only have two.</p>
        <p>&mdash; D</p>
        <hr style="border: none; border-top: 1px dashed #9b5a42; margin: 20px 0;" />
        <p style="font-size: 11px; color: #9b5a42;">
          Casa de Davin &middot; Denver-ish, CO &middot; Not a business, just a person.
        </p>
      </div>
    `,
    text: `${data.name} —\n\nOk you're in.\n\nI put you on ${roomLabel} for ${fmtDate(data.arrive)}–${fmtDate(data.depart)}.\n\n— D`,
  });
}

// ── Decline email to guest ──────────────────────────────────────────

export async function sendDeclineEmail(data: BookingEmailData, guestEmail: string): Promise<void> {
  const resend = getResend();
  const config = getConfig();

  await resend.emails.send({
    from: config.from,
    to: guestEmail,
    replyTo: config.to,
    subject: 'sadly, no',
    html: `
      <div style="font-family: Georgia, serif; max-width: 520px; color: #2b3524; line-height: 1.6;">
        <p>${data.name} &mdash;</p>
        <p>I can't make those dates work. Not a vibe thing, just a calendar thing.</p>
        <p>Reply with some other dates and I'll see what I can do.</p>
        <p>&mdash; D</p>
        <hr style="border: none; border-top: 1px dashed #9b5a42; margin: 20px 0;" />
        <p style="font-size: 11px; color: #9b5a42;">
          Casa de Davin &middot; Denver-ish, CO &middot; Not a business, just a person.
        </p>
      </div>
    `,
    text: `${data.name} —\n\nI can't make those dates work. Not a vibe thing, just a calendar thing.\n\nReply with some other dates and I'll see what I can do.\n\n— D`,
  });
}
