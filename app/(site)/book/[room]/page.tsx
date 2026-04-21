'use client';

import { useParams, useRouter } from 'next/navigation';
import BookingForm, { type Booking } from '@/components/form';

export default function BookPage() {
  const params = useParams<{ room: string }>();
  const router = useRouter();
  const room = params.room === 'couch' ? 'couch' as const : 'bedroom' as const;

  const handleSubmit = (booking: Booking) => {
    localStorage.setItem('casa_booking', JSON.stringify({
      ...booking,
      range: {
        start: booking.range.start?.toISOString() ?? null,
        end: booking.range.end?.toISOString() ?? null,
      },
    }));
    window.dispatchEvent(new CustomEvent('casa:toast', { detail: 'Sent. Calendar event added. Plants notified.' }));
    router.push('/confirmation');
  };

  return (
    <BookingForm
      room={room}
      onBack={() => router.push('/')}
      onSubmit={handleSubmit}
    />
  );
}
