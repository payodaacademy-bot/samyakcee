'use client';

import React, { useState, useEffect } from 'react';
import PublicNav from '@/components/PublicNav';
import HeroSection from './HeroSection';
import StatsSection from './StatsSection';
import SubjectsSection from './SubjectsSection';
import MCQPreviewSection from './MCQPreviewSection';
import BattleArenaSection from './BattleArenaSection';
import PricingSection from './PricingSection';
import TestimonialsSection from './TestimonialsSection';
import FAQSection from './FAQSection';
import HomepageFooter from './HomepageFooter';
import AnnouncementBar from './AnnouncementBar';
import PageTransitionWrapper from '@/components/PageTransitionWrapper';

export default function HomepageClient() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement?.classList?.add('dark');
    } else {
      document.documentElement?.classList?.remove('dark');
    }
  }, [isDark]);

  return (
    <PageTransitionWrapper>
      <div className="min-h-screen bg-background text-foreground">
        <AnnouncementBar />
        <PublicNav isDark={isDark} onToggleDark={() => setIsDark(!isDark)} />
        <HeroSection />
        <StatsSection />
        <SubjectsSection />
        <MCQPreviewSection />
        <BattleArenaSection />
        <PricingSection />
        <TestimonialsSection />
        <FAQSection />
        <HomepageFooter />
      </div>
    </PageTransitionWrapper>
  );
}