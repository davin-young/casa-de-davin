import { pgTable, text, timestamp, uuid, pgEnum } from 'drizzle-orm/pg-core';

export const roomEnum = pgEnum('room', ['couch', 'bedroom']);
export const statusEnum = pgEnum('booking_status', ['pending', 'approved', 'declined']);

export const bookings = pgTable('bookings', {
  id: uuid('id').defaultRandom().primaryKey(),
  ref: text('ref').notNull().unique(),
  name: text('name').notNull(),
  room: roomEnum('room').notNull(),
  arrive: text('arrive').notNull(),
  depart: text('depart').notNull(),
  status: statusEnum('status').notNull().default('pending'),
  why: text('why').notNull(),
  travel: text('travel').notNull().default(''),
  email: text('email'),
  calendarEventId: text('calendar_event_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
