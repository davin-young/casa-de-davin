# CLAUDE.md

## Project overview

Casa de Davin is a guest booking website for a personal apartment at 1900 Little Raven St, Denver, CO (LoDo). Friends pick a room (bedroom or couch), fill out a booking form, and the host gets an email + Google Calendar event. There's an admin panel for managing bookings.

## Tech stack

- **Next.js 15** with App Router, React 19, TypeScript
- **Drizzle ORM** with PostgreSQL (via `postgres` driver)
- **Google Calendar API** for booking sync (optional, degrades gracefully)
- **Resend** for transactional email (optional)
- **iron-session** for admin authentication
- **Vitest** for testing

## Architecture

### Pages & routing

Everything runs as a single-page client app via `app/page.tsx` → `components/app-shell.tsx`. Screen navigation is state-driven (`useState<Screen>`), not URL-based. Screens: landing, form, confirmation, admin, about, guestbook, error, share, emails, handoff.

### API routes

- `POST /api/book` — Public booking submission. Validates input, creates DB row, sends email via Resend, creates Google Calendar event.
- `GET /api/admin/bookings` — List all bookings (requires admin session).
- `GET/PATCH/DELETE /api/admin/bookings/[id]` — Manage individual bookings.
- `POST /api/admin/auth` — Admin login (password from `ADMIN_PASSWORD` env var).

### Database

Single `bookings` table. Schema in `db/schema.ts`. Uses Drizzle with postgres.js driver. Connection in `db/index.ts`.

Fields: id (uuid), ref, name, room (enum: couch/bedroom), arrive, depart, status (enum: pending/approved/declined), why, travel, email, calendarEventId, createdAt, updatedAt.

### Components

- `app-shell.tsx` — Main shell with nav bar, screen routing, tweaks panel
- `landing.tsx` — Hero + room cards
- `form.tsx` — Booking form with calendar picker
- `confirmation.tsx` — Post-submission confirmation
- `admin.tsx` — Admin panel for managing bookings
- `extras.tsx` — About page, guestbook, error screen, share page, email previews, handoff doc
- `shared.tsx` — Reusable UI: PaperSurface, MossButton, Toast, etc.
- `icons.tsx` — SVG icon components
- `silly.tsx` — Fun/joke components (WeatherChip, FeaturedIn, etc.)
- `tweaks.tsx` — Design tweaks panel (accent colors, paper tone, etc.)

### Design system

Organic/paper aesthetic. Key CSS variables defined in `app/globals.css`:
- Colors: `--moss`, `--terracotta`, `--honey`, `--sage`, `--oat`, `--linen`, `--ink`, `--umber`
- Fonts: `--serif` (Fraunces), `--sans` (Geist), `--hand` (Caveat), `--mono` (JetBrains Mono)
- Border radius uses asymmetric corners: `24px 16px 24px 16px`

### Lib

- `lib/email.ts` — Resend email sending
- `lib/google-calendar.ts` — Google Calendar event creation
- `lib/rate-limit.ts` — In-memory rate limiting
- `lib/session.ts` — iron-session config

## Development

```bash
npm run dev          # Start with Turbopack
npm test             # Run vitest
npm run db:migrate   # Run migrations
npm run db:seed      # Seed test data
npm run db:studio    # Drizzle Studio GUI
```

Docker Compose provides Postgres locally: `docker compose up -d`

## Key conventions

- All components use inline styles (no CSS modules or Tailwind)
- The `silly` prop/tweak toggles humorous content variations
- `PaperSurface` wraps sections that need the paper-grain texture
- `MossButton` is the primary CTA component (variants: primary, secondary, ghost)
- `.serif-display` class applies Fraunces with optical sizing for headlines
- `.hand` class applies Caveat for handwritten-style text

## SEO & privacy

- `robots.ts` blocks all crawlers and AI bots
- Meta robots set to noindex, nofollow
- Open Graph metadata is set for link previews when sharing

## Testing

Tests live in `tests/`. Uses Vitest. API tests mock the database and external services. Run with `npm test`.
