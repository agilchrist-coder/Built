import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Stipum — Blind Reveal Tool',
    template: '%s | Stipum',
  },
  description:
    'Submit answers blindly. Both parties reveal at the same time. Every agreement is hashed and timestamped on Base44.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'Stipum',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/icon-192.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#0A2540',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        {/* Inter font */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* PWA manifest */}
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="h-full">
        {children}

        {/* Register service worker for PWA / offline record caching */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function () {
                  navigator.serviceWorker
                    .register('/sw.js')
                    .then(function (reg) {
                      console.log('[Stipum SW] registered, scope:', reg.scope);
                    })
                    .catch(function (err) {
                      console.warn('[Stipum SW] registration failed:', err);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
