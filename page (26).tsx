import React from 'react';
import type { Metadata } from 'next';
import LectureVideosClient from './components/LectureVideosClient';

export const metadata: Metadata = {
  title: 'Video Lectures — Samyak CEE Mastery',
  description: 'Watch comprehensive video lectures by expert teachers. Master all CEE topics with clear explanations and visual learning aids.',
  alternates: {
    canonical: '/lecture-videos',
  },
  openGraph: {
    title: 'Video Lectures',
    description: 'Expert-led video lectures for CEE medical entrance preparation',
    url: '/lecture-videos',
    type: 'website',
    images: [
      {
        url: '/assets/images/app_logo.png',
        width: 1200,
        height: 630,
        alt: 'Video Lectures — Samyak CEE Mastery',
      },
    ],
  },
};

export default function LectureVideosPage() {
  return <LectureVideosClient />;
}
