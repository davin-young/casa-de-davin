import { pgTable, text, timestamp, uuid, pgEnum, boolean } from 'drizzle-orm/pg-core';

export const roomEnum = pgEnum('room', ['couch', 'bedroom']);
export const statusEnum = pgEnum('booking_status', ['pending', 'approved', 'declined']);

export const inviteCodes = pgTable('invite_codes', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: text('code').notNull().unique(),
  note: text('note'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  redeemedAt: timestamp('redeemed_at', { withTimezone: true }),
  redeemedBy: text('redeemed_by'),
});

export const blackoutDates = pgTable('blackout_dates', {
  id: uuid('id').defaultRandom().primaryKey(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  label: text('label').notNull(),
  room: roomEnum('room'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

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
  activities: text('activities').notNull().default(''),
  email: text('email'),
  notes: text('notes'),
  calendarEventId: text('calendar_event_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
