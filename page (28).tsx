import React from 'react';
import type { Metadata } from 'next';
import LiveClassesClient from './components/LiveClassesClient';

export const metadata: Metadata = {
  title: 'Live Classes — Samyak CEE Mastery',
  description: 'Join interactive live classes with top CEE teachers. Get real-time doubt clearing and personalized guidance for CEE 2026 exam.',
  alternates: {
    canonical: '/live-classes',
  },
  openGraph: {
    title: 'Live Classes',
    description: 'Interactive live classes with expert CEE teachers',
    url: '/live-classes',
    type: 'website',
    images: [
      {
        url: '/assets/images/app_logo.png',
        width: 1200,
        height: 630,
        alt: 'Live Classes — Samyak CEE Mastery',
      },
    ],
  },
};

export default function LiveClassesPage() {
  return <LiveClassesClient />;
}
