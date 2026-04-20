import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { bookings } from './schema';

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL is not set');
    process.exit(1);
  }

  const client = postgres(connectionString, { max: 1 });
  const db = drizzle(client);

  console.log('Seeding bookings...');

  await db.insert(bookings).values([
    {
      ref: 'CDD-00001',
      name: 'Kevin Ahn',
      room: 'bedroom',
      arrive: '2026-06-14',
      depart: '2026-06-17',
      status: 'pending',
      why: "Visiting for my cousin's thing. Bringing the good olive oil.",
      travel: 'Flying in Sat morning',
    },
    {
      ref: 'CDD-00002',
      name: 'Priya Rao',
      room: 'couch',
      arrive: '2026-06-20',
      depart: '2026-06-22',
      status: 'pending',
      why: 'Passing through on a road trip. Will bring the good olive oil and excellent gossip.',
      travel: 'Driving the Subaru',
    },
    {
      ref: 'CDD-00003',
      name: 'Marcus Webb',
      room: 'bedroom',
      arrive: '2026-07-03',
      depart: '2026-07-05',
      status: 'approved',
      why: 'Hiking plans. I promise not to wake you up.',
      travel: 'Flight arrives 9:40pm Thu',
    },
    {
      ref: 'CDD-00004',
      name: 'Sana Ibrahim',
      room: 'couch',
      arrive: '2026-07-11',
      depart: '2026-07-13',
      status: 'approved',
      why: "Denver for a wedding. Yes I know the bride is a mess. No I won't gossip. Much.",
      travel: 'Lyft from DEN',
    },
    {
      ref: 'CDD-00005',
      name: 'Leo Park',
      room: 'bedroom',
      arrive: '2026-06-25',
      depart: '2026-06-27',
      status: 'declined',
      why: 'Just vibes tbh',
      travel: '',
    },
    {
      ref: 'CDD-00006',
      name: 'Zoe Keller',
      room: 'couch',
      arrive: '2026-08-02',
      depart: '2026-08-06',
      status: 'pending',
      why: 'Flying in for a conference. Will absolutely bring the weirdly specific thing you asked about last summer.',
      travel: 'Flight + rental car',
    },
  ]);

  console.log('Seeded 6 bookings.');
  await client.end();
  process.exit(0);
}

main().catch((e) => {
  console.error('Seed failed:', e);
  process.exit(1);
});
