'use client';

import { useRouter } from 'next/navigation';
import { AboutPage } from '@/components/extras';

export default function About() {
  const router = useRouter();
  return <AboutPage onBack={() => router.push('/')} />;
}
