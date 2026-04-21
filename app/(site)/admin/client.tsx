'use client';

import { useRouter } from 'next/navigation';
import AdminPanel from '@/components/admin';

interface AdminClientProps {
  email?: string;
}

export default function AdminClient({ email }: AdminClientProps) {
  const router = useRouter();
  return <AdminPanel onBack={() => router.push('/')} adminEmail={email} />;
}
