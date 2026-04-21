'use client';

import { useRouter } from 'next/navigation';
import { Guestbook } from '@/components/extras';

export default function GuestbookPage() {
  const router = useRouter();
  return <Guestbook onBack={() => router.push('/')} />;
}
