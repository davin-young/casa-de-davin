'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SharePage } from '@/components/extras';
import { type Booking } from '@/components/form';

export default function Share() {
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

  return <SharePage onBack={() => router.push('/confirmation')} booking={booking} />;
}
