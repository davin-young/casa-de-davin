import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Casa de Davin',
  description: 'Two rooms. One host. Questionable hospitality.',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  openGraph: {
    title: 'Casa de Davin',
    description: 'Two rooms. One host. Questionable hospitality. 1900 Little Raven St, Denver, CO.',
    siteName: 'Casa de Davin',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Casa de Davin',
    description: 'Two rooms. One host. Questionable hospitality.',
  },
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;0,9..144,800;1,9..144,400;1,9..144,500&family=Geist:wght@300;400;500;600;700&family=Caveat:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {/* Paper noise SVG filters */}
        <svg width="0" height="0" style={{ position: 'absolute' }}>
          <filter id="paper-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4"/>
            <feColorMatrix values="0 0 0 0 0.17
                                   0 0 0 0 0.21
                                   0 0 0 0 0.14
                                   0 0 0 0.5 0"/>
          </filter>
          <filter id="paper-grain-warm">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7"/>
            <feColorMatrix values="0 0 0 0 0.48
                                   0 0 0 0 0.24
                                   0 0 0 0 0.16
                                   0 0 0 0.35 0"/>
          </filter>
        </svg>
        {children}
      </body>
    </html>
  );
}
