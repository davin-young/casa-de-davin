# Casa de Davin: Implementation Plans

## Plan 1: Admin Dashboard Completeness

### Current State

**Working:**
- Admin login via Google OAuth
- Middleware protecting `/admin` and `/api/admin/*`
- Booking list with status filters + detail sidebar
- Approve/decline/reset booking actions
- Invite codes (generate, copy, view used/unused)
- Stats API (basic counts)

**Broken / Incomplete:**
- [x] `/api/admin/bookings` may 500 if migrations not fully applied
- [x] Activity feed is hardcoded mock data

---

### 1.1 Bookings Enhancements

- [x] **DELETE booking endpoint** — `DELETE /api/admin/bookings/[id]` does not exist. Admin can't delete spam/test bookings.
- [x] **Search/sort** — No search input in admin panel. Add search by guest name, ref code, or reason text.
- [x] **Approval/decline emails** — PATCH endpoint updates status but never calls `sendApprovalEmail()` / `sendDeclineEmail()` from `lib/email.ts`. Wire these up.
- [x] **Bulk actions** — Checkbox select on booking rows + "Approve all" / "Decline all" / "Delete all" action bar. Calls PATCH/DELETE in a batch loop. Useful when multiple pending requests come in.
- [x] **Admin notes per booking** — Add `notes` text column to `bookings` table (nullable). Admin can jot down private notes ("bringing a dog", "needs parking info"). Editable in the detail sidebar. Not visible to guests.
- [x] **Overlap warning on approve** — When clicking "Approve", check if the booking overlaps with any other approved booking for the same room. Show a warning modal: "This overlaps with [Guest] on [dates]. Approve anyway?" before proceeding.
- [x] **Guest email not collected** — Booking form never asks for email. The `email` column exists in schema but is always null. Add optional email field to form + `/api/book`.

### 1.2 Stats & Analytics

- [x] **Auth-guard stats route** — `GET /api/stats` is public. Move to `/api/admin/stats` or add session check.
- [x] **Richer stats** — Only returns total + approved. Add: pending/declined counts, bookings this month, average stay length, room split, invite redemption rate.
- [x] **Analytics section in admin UI** — Add collapsible section below invite codes showing charts/metrics.

### 1.3 Activity Feed

- [x] **Make activity feed dynamic** — `ActivityStrip` renders hardcoded data. Derive from real bookings (sort by createdAt/updatedAt, show recent submissions and status changes).

### 1.4 Invite Code Management

- [x] **Delete/revoke invite codes** — No way to invalidate an unredeemed code. Add `DELETE /api/admin/invites/[id]` + "Revoke" button in UI.
- [x] **Copy full invite URL** — Currently copies just the code. Copy `https://visit.davinyoung.com?code=ABCDEF` instead.

### 1.5 Admin Session & UX

- [x] **Logout endpoint** — No way to sign out. Create `POST /api/auth/logout` that destroys session + add logout button to admin header.
- [x] **Display admin email** — `adminEmail` is passed as prop but never rendered. Show it in the header.
- [x] **Session expiry handling** — If admin session expires mid-use, API calls silently fail with 401. Detect 401 responses in `fetchBookings`/`fetchCodes` and redirect to `/login?auth_error=session_expired` with a "Session expired, please sign in again" message.

### 1.6 Guest Booking Lookup

Guests receive a confirmation ref like `CDD-A7X2K` after booking. They should be able to check their booking status without needing admin access.

#### Public Lookup Page
- [x] **New route `app/(site)/booking/[ref]/page.tsx`** — Public page at `/booking/CDD-A7X2K`
- [x] Shows: guest name, room, dates, nights, status (pending/approved/declined), submitted date
- [x] Styled like the confirmation page — read-only, no edit, organic paper aesthetic
- [x] Status badge: pending = honey, approved = moss, declined = terracotta
- [x] If approved: show a friendly "You're in!" message with check-in details
- [x] If declined: show a kind "Sorry, not this time" message
- [x] If pending: show "Sit tight — Davin's reviewing your request"

#### API
- [x] **`GET /api/booking/[ref]`** — Public endpoint, returns booking by ref code
  - Only returns: name, room, arrive, depart, status, createdAt (NOT email, why, travel — keep those private to admin)
  - Returns 404 if ref not found
  - No auth required (the ref code itself acts as a bearer token — it's unguessable)

#### Confirmation Page Update
- [x] **Show ref prominently** on the confirmation page after submission (`components/confirmation.tsx`)
- [x] Add "Bookmark this link to check your status" with copyable URL: `/booking/CDD-A7X2K`
- [x] If guest provided email, include the ref + link in the confirmation email

#### Email Notifications
- [x] **On approve/decline**, if guest email exists, send an email with:
  - Current status
  - Link to `/booking/CDD-A7X2K` to check anytime
  - Friendly tone matching the site's voice

#### Guest Cancellation
- [x] **"Cancel my booking" button** on the lookup page — only visible if status is `pending` or `approved`
- [x] Confirmation dialog: "Are you sure? This can't be undone."
- [x] **`POST /api/booking/[ref]/cancel`** — Sets status to `declined`, no auth required (ref is the token)
- [x] If Google Calendar event exists, delete it via `lib/google-calendar.ts`
- [x] If guest email exists, send a cancellation confirmation email
- [x] Admin gets notified (email or just visible in the dashboard as a status change)

#### Open Graph / Link Previews
- [x] **Dynamic OG metadata** on `/booking/[ref]` — "Casa de Davin — Booking CDD-A7X2K" with status in description
- [x] When guests share their booking link, it previews nicely in iMessage/Slack/etc.

#### Security
- [x] Ref codes are already random 5-char alphanumeric (`CDD-XXXXX`) — ~60M combinations, practically unguessable
- [x] Rate-limit the lookup endpoint to prevent enumeration (reuse existing rate limiter)
- [x] Rate-limit the cancel endpoint separately (prevent abuse)
- [x] Never expose admin-only fields (why, travel, activities, email) in the public response

### 1.7 Infrastructure & Error Handling

#### Health Check
- [x] **`GET /api/health`** — Returns `{ ok: true, db: "connected" }` if DB is reachable, `{ ok: false, db: "unreachable" }` with 503 if not
- [x] Useful for uptime monitoring (UptimeRobot, Vercel cron, etc.)
- [x] No auth required

#### Error Boundary Pages
- [x] **`app/not-found.tsx`** — Custom 404 page styled with `PaperSurface`, organic aesthetic. Friendly message: "This page wandered off. Try heading back to the house." with link to `/`
- [x] **`app/error.tsx`** — Custom 500 error boundary. "Something broke. Probably not your fault." with retry button. Must be a client component (`'use client'`)
- [x] **`app/(site)/not-found.tsx`** — Separate 404 for the site route group if needed (inherits layout styling)
- [x] All error pages match the paper/organic design system — same fonts, colors, grain texture

---

## Plan 2: Calendar Blocked Dates

### 2.1 Database: `blackout_dates` Table

- [x] Add to `db/schema.ts`: `id` (uuid), `startDate` (text ISO), `endDate` (text ISO), `label` (text), `room` (nullable room enum — null = both rooms), `createdAt` (timestamp)
- [x] Generate + run migration

### 2.2 Public API: Blocked Dates

- [x] **`GET /api/blocked-dates`** — Public (guests need it). Merges:
  - Approved bookings → `{ start, end, room, type: 'booking' }`
  - Blackout dates → `{ start, end, room, label, type: 'blackout' }`
  - Optional `?room=couch&from=2026-06-01&to=2026-09-30` params

### 2.3 Admin CRUD: Blackout Dates

- [x] **`GET/POST /api/admin/blackouts`** — List all / create new blackout period
- [x] **`DELETE /api/admin/blackouts/[id]`** — Remove a blackout

### 2.4 Calendar Component Refactor

- [x] **Remove hardcoded `BLACKOUTS` array** from `components/form.tsx`
- [x] Accept `blockedDates` as prop, fetched from `/api/blocked-dates`
- [x] Differentiate visuals: booked (hatched/"taken") vs admin blackout (gray/"unavailable")
- [x] Room-specific: couch bookings only block couch calendar, etc. Blackouts with `room: null` block both.

### 2.5 Server-Side Overlap Validation

- [x] In `POST /api/book`, after basic validation, check requested dates don't overlap with approved bookings (same room) or any blackout dates
- [x] Return 409 Conflict if overlap: `"Those dates are already taken."`

### 2.6 Admin UI: Blackout Management

- [x] New `BlackoutDatesSection` in admin panel (similar to `InviteCodesSection`)
- [x] List current blackouts with date range, label, room, delete button
- [x] "Add blackout" form: start date, end date, label, optional room
### 2.7 Admin Calendar View

A full visual calendar in the admin panel showing all bookings and blackouts at a glance — the host's primary tool for understanding availability.

#### Layout & Navigation
- [x] **Month grid calendar** — Full-width section in admin panel, above or below the bookings list
- [x] **Month navigation** — Prev/next arrows + "Today" button, month/year label
- [x] **Multi-month view toggle** — Option to show 1, 2, or 3 months side-by-side for planning ahead

#### Visual Layers (color-coded)
- [x] **Approved bookings** — Colored bars spanning arrive→depart, labeled with guest name
  - Bedroom bookings: moss/green bar
  - Couch bookings: honey/amber bar
- [x] **Pending bookings** ��� Same layout but dashed/semi-transparent, to show requests awaiting approval
- [x] **Declined bookings** — Hidden by default, toggle to show (faded red, strikethrough)
- [x] **Blackout dates** — Solid gray bars with diagonal hatch pattern, labeled with reason
- [x] **Today marker** — Subtle highlight or dot on current date

#### Interactions
- [x] **Click a booking bar** — Opens the booking detail sidebar (reuse existing `BookingDetail` component)
- [x] **Click a blackout bar** — Shows blackout info with option to delete
- [x] **Click an empty date range** — Opens "Add blackout" quick-form pre-filled with that date
- [x] **Hover tooltip** — On any bar, show: guest name, room, dates, status, nights

#### Data
- [x] **Fetch from `/api/admin/bookings`** (already available) + `/api/admin/blackouts`
- [x] **Room lanes** — Two swim-lanes: one for bedroom, one for couch. Blackouts with `room: null` span both lanes.
- [x] **Date range** — Default to current month ± 1 month. Lazy-load more months on navigation.

#### Admin "Add to My Calendar" Button
- [x] **Per-booking "Add to Calendar" button** in the booking detail sidebar — generates a Google Calendar event link (`https://calendar.google.com/calendar/r/eventedit?...`) pre-filled with guest name, room, arrive/depart dates, and reason
- [x] **Sync with Google Calendar API** — If `GOOGLE_CALENDAR_ID` is configured, use the existing `lib/google-calendar.ts` to create/update events server-side when approving. Show "Synced" badge if `calendarEventId` exists on the booking.
- [x] **Manual fallback** — If Google Calendar API isn't configured, show a `.ics` download button that generates an iCal file the admin can import into any calendar app

#### Component Architecture
- [x] **New `AdminCalendar` component** in `components/admin-calendar.tsx`
- [x] Reuse design system: `PaperSurface`, `SectionLabel`, inline styles, same color palette
- [x] Mobile: stack room lanes vertically, allow horizontal scroll on the date axis

---

## Plan 3: E2E Testing with Playwright

### Setup

- [x] Install: `npm install -D @playwright/test`
- [x] Create `playwright.config.ts` (base URL `http://localhost:3000`, chromium)
- [x] Create `e2e/` directory
- [x] Create `e2e/helpers.ts` — shared utilities: `loginAsGuest()`, `loginAsAdmin()`, `seedDatabase()`, `cleanDatabase()`

### 3.1 Site Gate (`e2e/site-gate.spec.ts`)

- [x] Shows gate when not authenticated
- [x] Rejects invalid code (expect "Invalid code")
- [x] Accepts site password (`SITE_PASSWORD` env)
- [x] Accepts valid invite code → unlocks site
- [x] Invite code is single-use (second attempt fails)
- [x] Session persists across page reloads
- [x] DEV bypass works in development

### 3.2 Guest Booking Flow (`e2e/booking-flow.spec.ts`)

- [x] Landing page shows room cards after unlock
- [x] Navigate to couch/bedroom booking
- [x] Form validation: empty submission blocked
- [x] Form validation: name, dates, reason all required
- [x] Calendar navigation (next/prev month)
- [x] Calendar date range selection
- [x] Calendar blackout dates are not clickable
- [x] Successful booking → redirect to confirmation
- [x] Confirmation page shows booking details
- [x] Rate limiting: second submit within 60s returns 429

### 3.3 Admin Login (`e2e/admin-login.spec.ts`)

- [x] Unauthenticated → redirect to `/login`
- [x] Login page shows "Sign in with Google" button
- [x] Google OAuth redirect fires on click
- [x] Auth error messages display correctly (`?auth_error=not_authorized`)
- [x] Mock login via cookie injection → admin panel loads

### 3.4 Admin Panel (`e2e/admin-panel.spec.ts`)

- [x] Dashboard heading + stat tiles visible
- [x] Bookings list loads with seeded data
- [x] Filter by status (pending/approved/declined)
- [x] Click booking → detail sidebar opens
- [x] Approve booking → status updates
- [x] Decline booking → status updates
- [x] Reset to pending → status reverts
- [x] Invite codes section visible
- [x] Generate invite code with note
- [x] Copy invite code to clipboard
- [x] Bulk select bookings → approve all → statuses update
- [x] Add admin note to booking → note persists on reload
- [x] Approve overlapping booking → warning modal appears
- [x] Session expires during use → redirects to login with "session expired" message

### 3.5 Admin API Routes (`e2e/admin-api.spec.ts`)

- [x] `GET /api/admin/bookings` — 401 without session, 200 with session
- [x] `PATCH /api/admin/bookings/[id]` — 400 invalid status, 404 not found
- [x] `GET /api/admin/invites` — 401 without session
- [x] `POST /api/admin/invites` — generates code with note

### 3.6 Auth Middleware (`e2e/middleware.spec.ts`)

- [x] `/admin` → 302 redirect to `/login` (no session)
- [x] `/api/admin/bookings` → 401 JSON (no session)
- [x] `/api/admin/auth` → 403 (intentionally disabled)
- [x] Guest session → normal site access, no admin access
- [x] Admin session → full admin access

### 3.7 Public API Routes (`e2e/public-api.spec.ts`)

- [x] `POST /api/book` — valid submission → `{ ok: true, ref }`
- [x] `POST /api/book` — missing name → 400
- [x] `POST /api/book` — invalid room → 400
- [x] `POST /api/invite/redeem` — valid code → `{ ok: true }`
- [x] `POST /api/invite/redeem` — invalid code → 401
- [x] `GET /api/auth/status` — no session → `{ isGuest: false, isAdmin: false }`
- [x] `GET /api/auth/status` — guest session → `{ isGuest: true, isAdmin: false }`

### 3.8 Guest Booking Lookup (`e2e/booking-lookup.spec.ts`)

- [x] Valid ref → shows booking status page with name, room, dates, status
- [x] Invalid ref → 404 page
- [x] Approved booking → shows "You're in!" message
- [x] Pending booking → shows "Sit tight" message
- [x] Declined booking → shows "Sorry" message
- [x] Does NOT expose private fields (why, travel, email)
- [x] Rate-limited: rapid requests get 429
- [x] Guest cancels pending booking → status changes to declined, page updates
- [x] Guest cancels approved booking → status changes, confirmation dialog shown first
- [x] Cancel button hidden on already-declined bookings
- [x] OG metadata renders correctly (check `<meta>` tags)

### 3.9 Health & Error Pages (`e2e/error-pages.spec.ts`)

- [x] `GET /api/health` → `{ ok: true }` when DB is up
- [x] Navigate to `/nonexistent-page` → custom 404 page with paper styling
- [x] 404 page has link back to home
- [x] Error boundary catches runtime errors gracefully

### 3.10 Navigation & Layout (`e2e/navigation.spec.ts`)

- [x] Nav bar renders after unlock (Rooms, About, Guestbook, Admin)
- [x] Active nav highlighting works
- [x] Admin link redirects appropriately
- [x] Back button on booking form works
- [x] Toast appears after booking submission

### 3.11 Responsive (`e2e/responsive.spec.ts`)

- [x] Mobile gate (375x667) renders without overflow
- [x] Mobile booking form — calendar is usable
- [x] Mobile admin panel — bookings list scrollable

### Test Infrastructure Notes

- **Database**: Use a test Postgres instance (Docker or separate `DATABASE_URL_TEST`)
- **Seeding**: `e2e/seed.ts` inserts known bookings, invite codes
- **Cleanup**: `beforeEach`/`afterAll` truncate tables
- **Session mocking**: Use Playwright `storageState` or `addCookies()` with pre-built iron-session cookie for admin tests

---

## Priority Sequencing

| Phase   | Focus                    | Key Items                                                                                    |
|---------|--------------------------|----------------------------------------------------------------------------------------------|
| **1**   | Critical fixes           | Migrations applied, wire up emails, add guest email field, fix stats auth                    |
| **1.5** | Guest booking lookup     | `/booking/[ref]` page, public API, guest cancellation, OG metadata, confirmation update      |
| **2**   | Calendar blocked dates   | `blackout_dates` table, `/api/blocked-dates`, refactor calendar, overlap validation           |
| **2.5** | Admin calendar view      | `AdminCalendar` component, room swim-lanes, booking/blackout bars, add-to-calendar button    |
| **3**   | Admin completeness       | DELETE/bulk actions, notes, logout, overlap warning, dynamic activity, invite deletion, search |
| **3.5** | Infrastructure           | Health check endpoint, custom 404/500 error pages, session expiry handling                    |
| **4**   | E2E testing              | Playwright setup, helpers, all 11 test suites                                                |
