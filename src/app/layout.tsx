import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import '../../styles/tailwind.css';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta-sans',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#6366f1',
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'Samyak CEE Mastery — Nepal Medical Entrance Prep',
  description:
    "Nepal's most comprehensive CEE medical entrance platform. Premium notes, video lectures, MCQ practice, live classes, and real-time exam battles for 40,000+ aspirants.",
  manifest: '/manifest.json',
  icons: {
    icon: [{ url: '/favicon.ico', type: 'image/x-icon' }],
    apple: '/assets/images/app_logo.png',
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Samyak CEE Mastery',
    description: "Crack CEE 2026 with Nepal's #1 medical entrance prep platform",
    url: '/',
    siteName: 'Samyak CEE Mastery',
    locale: 'en_NP',
    type: 'website',
    images: [
      {
        url: '/assets/images/app_logo.png',
        width: 1200,
        height: 630,
        alt: 'Samyak CEE Mastery — Nepal Medical Entrance Prep',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Samyak CEE Mastery',
    description: "Crack CEE 2026 with Nepal's #1 medical entrance prep platform",
    images: ['/assets/images/app_logo.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={plusJakartaSans.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Samyak CEE Mastery',
              url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
              logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/assets/images/app_logo.png`,
              description: "Nepal's most comprehensive CEE medical entrance preparation platform",
              sameAs: [
                'https://www.facebook.com/samyakcee',
                'https://www.instagram.com/samyakcee',
                'https://www.youtube.com/samyakcee',
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'Customer Support',
                email: 'support@samyakcee.com.np',
              },
            }),
          }}
        />
      </head>
      <body className={plusJakartaSans.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster
          position="bottom-right"
          richColors
          toastOptions={{
            style: {
              fontFamily: 'var(--font-plus-jakarta-sans)',
              borderRadius: '10px',
              fontSize: '14px',
            },
          }}
        />
      </body>
    </html>
  );
}
