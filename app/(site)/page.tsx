'use client';

import { useRouter } from 'next/navigation';
import Landing from '@/components/landing';

export default function LandingPage() {
  const router = useRouter();
  return (
    <Landing
      onPickRoom={(room) => router.push(`/book/${room}`)}
    />
  );
}
