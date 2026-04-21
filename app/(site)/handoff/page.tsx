'use client';

import { useRouter } from 'next/navigation';
import { HandoffDoc } from '@/components/extras';

export default function HandoffPage() {
  const router = useRouter();
  return <HandoffDoc onBack={() => router.push('/admin')} />;
}
