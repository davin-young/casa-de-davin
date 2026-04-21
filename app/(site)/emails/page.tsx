'use client';

import { useRouter } from 'next/navigation';
import { EmailPreviews } from '@/components/extras';

export default function EmailsPage() {
  const router = useRouter();
  return <EmailPreviews onBack={() => router.push('/admin')} />;
}
