import { google, calendar_v3 } from 'googleapis';

// ── Interfaces ──────────────────────────────────────────────────────

export interface CalendarEventInput {
  name: string;
  room: 'couch' | 'bedroom';
  arrive: string;
  depart: string;
  why: string;
  travel: string;
  ref: string;
}

export interface CalendarEventResult {
  eventId: string;
  htmlLink: string;
}

type CalendarStatus = 'tentative' | 'confirmed' | 'cancelled';

// ── Config Guard ────────────────────────────────────────────────────

export function isCalendarConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_REFRESH_TOKEN,
  );
}

// ── Auth ────────────────────────────────────────────────────────────

function getCalendarClient(): calendar_v3.Calendar {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  );
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });

  return google.calendar({ version: 'v3', auth: oauth2Client });
}

// ── Color IDs ───────────────────────────────────────────────────────

const ROOM_COLORS: Record<string, string> = {
  couch: '11',
  bedroom: '10',
};

// ── Create ──────────────────────────────────────────────────────────

export async function createBookingEvent(input: CalendarEventInput): Promise<CalendarEventResult | null> {
  if (!isCalendarConfigured()) return null;

  const calendar = getCalendarClient();
  const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

  const description = [
    `Ref: ${input.ref}`,
    `Room: ${input.room}`,
    `Why: "${input.why}"`,
    input.travel ? `Travel: ${input.travel}` : '',
    '',
    '— submitted via casadedavin.house',
  ].filter(Boolean).join('\n');

  const response = await calendar.events.insert({
    calendarId,
    requestBody: {
      summary: `${input.name} → ${input.room} (casa)`,
      description,
      start: { date: input.arrive },
      end: { date: input.depart },
      status: 'tentative',
      colorId: ROOM_COLORS[input.room] || '10',
      transparency: 'transparent',
    },
  });

  return {
    eventId: response.data.id || '',
    htmlLink: response.data.htmlLink || '',
  };
}

// ── Update ──────────────────────────────────────────────────────────

export async function updateEventStatus(
  calendarEventId: string,
  status: 'pending' | 'approved' | 'declined',
): Promise<void> {
  if (!isCalendarConfigured()) return;

  const calendar = getCalendarClient();
  const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

  const calendarStatusMap: Record<string, CalendarStatus> = {
    pending: 'tentative',
    approved: 'confirmed',
    declined: 'cancelled',
  };

  await calendar.events.patch({
    calendarId,
    eventId: calendarEventId,
    requestBody: {
      status: calendarStatusMap[status],
    },
  });
}
