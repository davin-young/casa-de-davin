import type { Metadata } from 'next';
import type { ReactNode } from 'react';

interface Props {
  params: Promise<{ ref: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ref } = await params;
  return {
    title: `Booking ${ref} — Casa de Davin`,
    description: `Check the status of booking ${ref} at Casa de Davin.`,
    openGraph: {
      title: `Casa de Davin — Booking ${ref}`,
      description: `Check the status of your stay request.`,
      type: 'website',
    },
    robots: { index: false, follow: false },
  };
}

export default function BookingLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
