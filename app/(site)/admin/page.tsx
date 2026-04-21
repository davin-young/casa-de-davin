import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import AdminClient from './client';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const session = await getSession();

  // Double-check auth (middleware is the primary guard)
  if (!session.isAdmin) {
    redirect('/login');
  }

  return <AdminClient email={session.adminEmail} />;
}
