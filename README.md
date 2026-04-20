# Casa de Davin

A guest booking site for my apartment in Denver. Two rooms. One host. Questionable hospitality.

Friends pick a room, fill out a booking form, and I get an email + calendar event. That's the whole thing.

## Stack

- **Next.js 15** (App Router, Turbopack)
- **TypeScript**
- **Drizzle ORM** + PostgreSQL
- **Google Calendar API** for syncing bookings
- **Resend** for transactional email
- **iron-session** for admin auth

## Getting started

```bash
# Install dependencies
npm install

# Copy env file and fill in your values
cp .env.local.example .env.local

# Start Postgres (via Docker)
docker compose up -d

# Run migrations
npm run db:migrate

# Seed sample data (optional)
npm run db:seed

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with Turbopack |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate` | Run migrations |
| `npm run db:seed` | Seed sample bookings |
| `npm run db:studio` | Open Drizzle Studio |
| `npm test` | Run tests |
| `npm run docker:up` | Start everything via Docker |

## Environment variables

See `.env.local.example` for the full list. Google Calendar and Resend keys are optional for local dev — the app works without them, just skips calendar sync and email.

## Project structure

```
app/              Next.js App Router pages and API routes
  api/book/       POST — public booking submission
  api/admin/      Admin auth + booking management
components/       React components (landing, form, confirmation, admin, etc.)
db/               Drizzle schema, migrations, seed
lib/              Email, Google Calendar, rate limiting, session
types/            TypeScript types
tests/            Vitest test suite
public/           Static assets (favicon, images)
```

## License

This is a personal project. You're welcome to look around and steal ideas for your own questionable hospitality ventures.
