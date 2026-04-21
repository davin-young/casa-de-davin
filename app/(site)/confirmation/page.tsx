'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Confirmation from '@/components/confirmation';
import { type Booking } from '@/components/form';

export default function ConfirmationPage() {
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);

  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem('casa_booking') || 'null');
      if (raw) {
        setBooking({
          ...raw,
          range: {
            start: raw.range?.start ? new Date(raw.range.start) : null,
            end: raw.range?.end ? new Date(raw.range.end) : null,
          },
        });
      }
    } catch {}
  }, []);

  return (
    <Confirmation
      booking={booking}
      onBackToRooms={() => router.push('/')}
      onBookOther={() => {
        const other = booking?.room === 'couch' ? 'bedroom' : 'couch';
        router.push(`/book/${other}`);
      }}
      onShare={() => router.push('/share')}
    />
  );
}
