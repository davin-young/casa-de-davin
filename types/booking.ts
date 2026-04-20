import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import type { bookings } from '@/db/schema';

export type Booking = InferSelectModel<typeof bookings>;
export type NewBooking = InferInsertModel<typeof bookings>;
export type BookingStatus = 'pending' | 'approved' | 'declined';
export type RoomType = 'couch' | 'bedroom';
