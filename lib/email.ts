import { Resend } from 'resend';

// ── Interfaces ──────────────────────────────────────────────────────

export interface BookingEmailData {
  name: string;
  room: 'couch' | 'bedroom';
  arrive: string;
  depart: string;
  why: string;
  travel: string;
  activities: string;
  ref: string;
  email?: string;
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
        ${data.activities ? `<p style="margin: 0 0 8px; color: #3d4a33;"><em>Wants to do:</em> ${data.activities}</p>` : ''}
        <hr style="border: none; border-top: 1px dashed #9b5a42; margin: 20px 0;" />
        <p style="font-size: 13px; color: #9b5a42;">
          Ref: ${data.ref}${data.email ? `<br/>Guest email: <a href="mailto:${data.email}" style="color: #5a7d3a;">${data.email}</a>` : ''}<br/>
          <a href="https://casadedavin.house/admin" style="color: #5a7d3a;">Open admin panel</a>
        </p>
      </div>
    `,
    text: [
      `${data.name} · ${roomLabel} · ${fmtDate(data.arrive)} → ${fmtDate(data.depart)} (${nights} nights)`,
      `Why: "${data.why}"`,
      data.travel ? `Travel: ${data.travel}` : '',
      data.activities ? `Wants to do: ${data.activities}` : '',
      `Ref: ${data.ref}`,
    ].filter(Boolean).join('\n'),
  });
}

// ── Approval email to guest ─────────────────────────────────────────

export async function sendApprovalEmail(data: BookingEmailData, guestEmail: string): Promise<void> {
  const resend = getResend();
  const config = getConfig();
  const roomLabel = data.room === 'couch' ? 'the couch' : 'the bedroom';
  const bookingUrl = `https://casadedavin.house/booking/${data.ref}`;

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
        <p>Your booking: <a href="${bookingUrl}" style="color: #5a7d3a;">${data.ref}</a></p>
        <p>&mdash; D</p>
        <hr style="border: none; border-top: 1px dashed #9b5a42; margin: 20px 0;" />
        <p style="font-size: 11px; color: #9b5a42;">
          Casa de Davin &middot; Denver-ish, CO &middot; Not a business, just a person.
        </p>
      </div>
    `,
    text: `${data.name} —\n\nOk you're in.\n\nI put you on ${roomLabel} for ${fmtDate(data.arrive)}–${fmtDate(data.depart)}.\n\nYour booking: ${bookingUrl}\n\n— D`,
  });
}

// ── Cancellation confirmation to guest ──────────────────────────────

export async function sendCancellationEmail(data: BookingEmailData, guestEmail: string): Promise<void> {
  const resend = getResend();
  const config = getConfig();
  const roomLabel = data.room === 'couch' ? 'the couch' : 'the bedroom';

  await resend.emails.send({
    from: config.from,
    to: guestEmail,
    replyTo: config.to,
    subject: 'booking cancelled',
    html: `
      <div style="font-family: Georgia, serif; max-width: 520px; color: #2b3524; line-height: 1.6;">
        <p>${data.name} &mdash;</p>
        <p>Your booking for ${roomLabel} (${fmtDate(data.arrive)}&ndash;${fmtDate(data.depart)}) has been cancelled.</p>
        <p>If this was a mistake, just reply to this email or submit a new request.</p>
        <p>&mdash; D</p>
        <hr style="border: none; border-top: 1px dashed #9b5a42; margin: 20px 0;" />
        <p style="font-size: 11px; color: #9b5a42;">
          Casa de Davin &middot; Denver-ish, CO &middot; Not a business, just a person.
        </p>
      </div>
    `,
    text: `${data.name} —\n\nYour booking for ${roomLabel} (${fmtDate(data.arrive)}–${fmtDate(data.depart)}) has been cancelled.\n\nIf this was a mistake, just reply to this email or submit a new request.\n\n— D`,
  });
}

// ── Guest receipt (immediate, on submission) ───────────────────────

export async function sendGuestReceipt(data: BookingEmailData, guestEmail: string): Promise<void> {
  const resend = getResend();
  const config = getConfig();
  const nights = nightCount(data.arrive, data.depart);
  const roomLabel = data.room === 'couch' ? 'the couch' : 'the bedroom';

  await resend.emails.send({
    from: config.from,
    to: guestEmail,
    replyTo: config.to,
    subject: `got your plea, ${data.name.split(' ')[0]}`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 520px; color: #2b3524; line-height: 1.6;">
        <p>${data.name} &mdash;</p>
        <p>Your plea has been received. I&rsquo;m reviewing it with the seriousness it deserves,
        which is to say: over coffee, squinting at my calendar.</p>
        <p style="margin: 18px 0; padding: 16px; background: #f2ead8; border: 1px dashed #9b5a42; border-radius: 10px 4px 10px 4px;">
          <strong>${roomLabel}</strong><br/>
          ${fmtDate(data.arrive)} &rarr; ${fmtDate(data.depart)} &middot; ${nights} night${nights !== 1 ? 's' : ''}<br/>
          <span style="color: #9b5a42; font-size: 13px;">Ref: ${data.ref}</span>
        </p>
        <p>I&rsquo;ll get back to you soon. If you don&rsquo;t hear from me in 48 hours,
        it&rsquo;s not personal. I probably got distracted watering plants.</p>
        <p>&mdash; Davin<br/>
        <span style="font-style: italic; color: #9b5a42; font-size: 13px;">(the person, not the corporation)</span></p>
        <hr style="border: none; border-top: 1px dashed #9b5a42; margin: 20px 0;" />
        <p style="font-size: 11px; color: #9b5a42;">
          Casa de Davin &middot; Denver-ish, CO &middot; Not a business, just a person with a spare room.
        </p>
      </div>
    `,
    text: `${data.name} —\n\nYour plea has been received. I'm reviewing it with the seriousness it deserves.\n\n${roomLabel}\n${fmtDate(data.arrive)} → ${fmtDate(data.depart)} · ${nights} nights\nRef: ${data.ref}\n\nI'll get back to you soon.\n\n— Davin`,
  });
}

// ── Pre-arrival reminder to guest (1 day before) ───────────────────

export async function sendGuestPreArrival(data: BookingEmailData, guestEmail: string): Promise<void> {
  const resend = getResend();
  const config = getConfig();
  const roomLabel = data.room === 'couch' ? 'the couch' : 'the bedroom';

  await resend.emails.send({
    from: config.from,
    to: guestEmail,
    replyTo: config.to,
    subject: `tomorrow! you're actually coming`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 520px; color: #2b3524; line-height: 1.6;">
        <p>${data.name} &mdash;</p>
        <p>This is your 24-hour warning. You are expected at Casa de Davin tomorrow.</p>
        <p><strong>A few things:</strong></p>
        <ul style="color: #3d4a33; padding-left: 20px;">
          <li>I&rsquo;ll text you the door code the morning of. Don&rsquo;t share it with anyone suspicious (or anyone, really).</li>
          <li>You&rsquo;re on <strong>${roomLabel}</strong>. It will be ready. The plants have been briefed.</li>
          <li>Parking is on the street or in the garage. If someone yells at you about a spot, that wasn&rsquo;t me.</li>
          <li>The Wi-Fi password is on the fridge. Yes, it&rsquo;s a pun. No, I&rsquo;m not sorry.</li>
        </ul>
        <p>See you tomorrow. Don&rsquo;t bring me anything. (Unless it&rsquo;s good coffee.)</p>
        <p>&mdash; D</p>
        <hr style="border: none; border-top: 1px dashed #9b5a42; margin: 20px 0;" />
        <p style="font-size: 11px; color: #9b5a42;">Casa de Davin &middot; Denver-ish, CO</p>
      </div>
    `,
    text: `${data.name} —\n\nThis is your 24-hour warning. You are expected at Casa de Davin tomorrow.\n\nYou're on ${roomLabel}. Wi-Fi password is on the fridge.\n\nSee you tomorrow.\n\n— D`,
  });
}

// ── Pre-arrival reminder to host (1 day before) ────────────────────

export async function sendHostPreArrival(data: BookingEmailData): Promise<void> {
  const resend = getResend();
  const config = getConfig();
  const nights = nightCount(data.arrive, data.depart);
  const roomLabel = data.room === 'couch' ? 'the couch' : 'the bedroom';

  await resend.emails.send({
    from: config.from,
    to: config.to,
    subject: `⚡ ${data.name} arrives tomorrow`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 520px; color: #2b3524; line-height: 1.6;">
        <p>Hey future you &mdash;</p>
        <p><strong>${data.name}</strong> is showing up tomorrow for ${nights} night${nights !== 1 ? 's' : ''} on ${roomLabel}.</p>
        <p><strong>Checklist (you know the drill):</strong></p>
        <ul style="color: #3d4a33; padding-left: 20px;">
          <li>Fresh sheets on ${roomLabel}</li>
          <li>Clean towels out</li>
          <li>Fridge stocked (at minimum: oat milk, eggs, something that isn&rsquo;t expired)</li>
          <li>Bathroom check (the hair situation, Davin)</li>
          <li>Text them the door code in the morning</li>
        </ul>
        <p>You got this. Probably.</p>
        <hr style="border: none; border-top: 1px dashed #9b5a42; margin: 20px 0;" />
        <p style="font-size: 13px; color: #9b5a42;">Ref: ${data.ref}</p>
      </div>
    `,
    text: `${data.name} arrives tomorrow for ${nights} nights on ${roomLabel}.\n\nChecklist:\n- Fresh sheets\n- Clean towels\n- Fridge stocked\n- Bathroom check\n- Text them the door code\n\nRef: ${data.ref}`,
  });
}

// ── Host nudge (pending >24h) ──────────────────────────────────────

export async function sendHostNudge(data: BookingEmailData): Promise<void> {
  const resend = getResend();
  const config = getConfig();
  const roomLabel = data.room === 'couch' ? 'the couch' : 'the bedroom';

  await resend.emails.send({
    from: config.from,
    to: config.to,
    subject: `nudge: ${data.name} is still waiting`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 520px; color: #2b3524; line-height: 1.6;">
        <p>Hey &mdash;</p>
        <p><strong>${data.name}</strong> submitted a booking request over 24 hours ago and you haven&rsquo;t responded.</p>
        <p>${roomLabel} &middot; ${fmtDate(data.arrive)} &rarr; ${fmtDate(data.depart)}</p>
        <p>They&rsquo;re out there refreshing their inbox. Don&rsquo;t be that host.</p>
        <p><a href="https://casadedavin.house/admin" style="color: #5a7d3a; font-weight: bold;">Go approve or decline &rarr;</a></p>
        <hr style="border: none; border-top: 1px dashed #9b5a42; margin: 20px 0;" />
        <p style="font-size: 13px; color: #9b5a42;">Ref: ${data.ref}</p>
      </div>
    `,
    text: `${data.name} submitted a booking request over 24 hours ago.\n\n${roomLabel} · ${fmtDate(data.arrive)} → ${fmtDate(data.depart)}\n\nGo approve or decline: https://casadedavin.house/admin\n\nRef: ${data.ref}`,
  });
}

// ── Post-stay thank you to guest ───────────────────────────────────

export async function sendGuestPostStay(data: BookingEmailData, guestEmail: string): Promise<void> {
  const resend = getResend();
  const config = getConfig();
  const roomLabel = data.room === 'couch' ? 'the couch' : 'the bedroom';

  await resend.emails.send({
    from: config.from,
    to: guestEmail,
    replyTo: config.to,
    subject: `you survived casa de davin`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 520px; color: #2b3524; line-height: 1.6;">
        <p>${data.name} &mdash;</p>
        <p>You made it out alive. Congratulations.</p>
        <p>I hope ${roomLabel} treated you well and that you didn&rsquo;t accidentally
        kill any of my plants. (I&rsquo;ll check.)</p>
        <p>If you had a good time &mdash; or even a mediocre one &mdash; I&rsquo;d love a note
        in the <a href="https://casadedavin.house" style="color: #5a7d3a;">guestbook</a>.
        It&rsquo;s mostly for my ego, but also so future guests know what they&rsquo;re getting into.</p>
        <p>Come back anytime. The plants miss you already. (I&rsquo;m fine.)</p>
        <p>&mdash; D</p>
        <hr style="border: none; border-top: 1px dashed #9b5a42; margin: 20px 0;" />
        <p style="font-size: 11px; color: #9b5a42;">Casa de Davin &middot; Denver-ish, CO &middot; Come again, or don&rsquo;t. (But do.)</p>
      </div>
    `,
    text: `${data.name} —\n\nYou made it out alive. Congratulations.\n\nIf you had a good time, leave a note in the guestbook: https://casadedavin.house\n\nCome back anytime.\n\n— D`,
  });
}

// ── Post-stay reminder to host ─────────────────────────────────────

export async function sendHostPostStay(data: BookingEmailData): Promise<void> {
  const resend = getResend();
  const config = getConfig();
  const roomLabel = data.room === 'couch' ? 'the couch' : 'the bedroom';

  await resend.emails.send({
    from: config.from,
    to: config.to,
    subject: `🧹 ${data.name} left — time to reset`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 520px; color: #2b3524; line-height: 1.6;">
        <p>Hey &mdash;</p>
        <p><strong>${data.name}</strong>&rsquo;s stay on ${roomLabel} is over.</p>
        <p><strong>Reset checklist:</strong></p>
        <ul style="color: #3d4a33; padding-left: 20px;">
          <li>Strip and wash sheets</li>
          <li>Collect towels</li>
          <li>Check for forgotten items (check under ${data.room === 'couch' ? 'cushions' : 'the bed'})</li>
          <li>Restock bathroom basics</li>
          <li>Water the plants (they&rsquo;ve been through a lot)</li>
          <li>Change the Wi-Fi password if you&rsquo;re feeling dramatic</li>
        </ul>
        <p>Good hosting. Gold star. ⭐</p>
        <hr style="border: none; border-top: 1px dashed #9b5a42; margin: 20px 0;" />
        <p style="font-size: 13px; color: #9b5a42;">Ref: ${data.ref}</p>
      </div>
    `,
    text: `${data.name}'s stay on ${roomLabel} is over.\n\nReset checklist:\n- Strip and wash sheets\n- Collect towels\n- Check for forgotten items\n- Restock bathroom\n- Water the plants\n\nRef: ${data.ref}`,
  });
}

// ── Decline email to guest ──────────────────────────────────────────

export async function sendDeclineEmail(data: BookingEmailData, guestEmail: string): Promise<void> {
  const resend = getResend();
  const config = getConfig();
  const bookingUrl = `https://casadedavin.house/booking/${data.ref}`;

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
        <p>Your booking: <a href="${bookingUrl}" style="color: #5a7d3a;">${data.ref}</a></p>
        <p>&mdash; D</p>
        <hr style="border: none; border-top: 1px dashed #9b5a42; margin: 20px 0;" />
        <p style="font-size: 11px; color: #9b5a42;">
          Casa de Davin &middot; Denver-ish, CO &middot; Not a business, just a person.
        </p>
      </div>
    `,
    text: `${data.name} —\n\nI can't make those dates work. Not a vibe thing, just a calendar thing.\n\nReply with some other dates and I'll see what I can do.\n\nYour booking: ${bookingUrl}\n\n— D`,
  });
}
