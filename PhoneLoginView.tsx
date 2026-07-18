'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Play, Star, Zap, CheckCircle2 } from 'lucide-react';

function useCEECountdown() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // CEE 2026 approximate date
    const target = new Date('2026-04-15T08:00:00');
    const tick = () => {
      const now = new Date();
      const diff = target.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return timeLeft;
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center bg-card/80 backdrop-blur rounded-xl border border-border px-3 py-2 sm:px-4 sm:py-3 min-w-[56px] sm:min-w-[72px]">
      <span className="font-mono text-xl sm:text-2xl font-bold text-primary tabular-nums leading-none">
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-xs text-muted-foreground mt-1 font-medium">{label}</span>
    </div>
  );
}

const highlights = [
  { key: 'hl-mcq', text: '15,000+ MCQs with explanations' },
  { key: 'hl-notes', text: 'Chapter-wise premium notes' },
  { key: 'hl-live', text: 'Live classes by top teachers' },
  { key: 'hl-battle', text: 'Real-time 2-player battles' },
];

export default function HeroSection() {
  const countdown = useCEECountdown();

  return (
    <section className="relative pt-28 sm:pt-32 pb-16 sm:pb-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-hero" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] blob-primary opacity-60 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] blob-accent opacity-40 pointer-events-none" />

      <div className="relative max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-secondary border border-primary/20 text-primary text-sm font-semibold px-3 py-1.5 rounded-full">
              <Star size={13} className="fill-primary" />
              Nepal&apos;s #1 CEE Preparation Platform
            </div>

            <h1 className="text-hero-xl text-foreground">
              Crack CEE 2026{' '}
              <span className="text-primary">with Confidence</span>
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
              Premium notes, video lectures, MCQ practice, live classes, and real-time exam battles — everything you need to secure your seat in MBBS.
            </p>

            <ul className="space-y-2">
              {highlights.map((h) => (
                <li key={h.key} className="flex items-center gap-2 text-sm text-foreground">
                  <CheckCircle2 size={16} className="text-accent shrink-0" />
                  {h.text}
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-3">
              <Link href="/practice" className="btn-primary gap-2">
                Start Free Today
                <ArrowRight size={16} />
              </Link>
              <button className="btn-secondary gap-2">
                <Play size={15} className="fill-primary" />
                Watch Demo
              </button>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <div className="flex -space-x-2">
                {['P', 'A', 'S', 'R', 'M'].map((initial, i) => (
                  <div
                    key={`avatar-${initial}-${i}`}
                    className="w-8 h-8 rounded-full border-2 border-card flex items-center justify-center text-xs font-bold text-white"
                    style={{ backgroundColor: ['#5B4BFF','#16A36A','#8B5CF6','#2563EB','#E59A18'][i], zIndex: 5 - i }}
                  >
                    {initial}
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">40,000+</span> students preparing right now
              </p>
            </div>
          </div>

          {/* Right — CEE Countdown + floating cards */}
          <div className="relative flex flex-col items-center">
            <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-card w-full max-w-md animate-float">
              <div className="text-center mb-6">
                <p className="section-label mb-2">CEE 2026 Countdown</p>
                <p className="text-sm text-muted-foreground">Health Sciences Entrance Examination</p>
              </div>
              <div className="flex items-center justify-center gap-3">
                <CountdownUnit value={countdown.days} label="Days" />
                <span className="text-2xl font-bold text-muted-foreground pb-2">:</span>
                <CountdownUnit value={countdown.hours} label="Hours" />
                <span className="text-2xl font-bold text-muted-foreground pb-2">:</span>
                <CountdownUnit value={countdown.minutes} label="Mins" />
                <span className="text-2xl font-bold text-muted-foreground pb-2">:</span>
                <CountdownUnit value={countdown.seconds} label="Secs" />
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="bg-bio-light rounded-xl p-3 text-center">
                  <p className="font-bold text-xl text-bio tabular-nums">92%</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Avg. Accuracy Gain</p>
                </div>
                <div className="bg-secondary rounded-xl p-3 text-center">
                  <p className="font-bold text-xl text-primary tabular-nums">4.9★</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Student Rating</p>
                </div>
              </div>
              <Link href="/sign-up-login-screen" className="btn-primary w-full mt-4 justify-center">
                Join 40,000+ Students
              </Link>
            </div>

            {/* Floating badge */}
            <div className="absolute -bottom-4 -left-4 bg-card border border-border rounded-xl px-3 py-2 shadow-card flex items-center gap-2 animate-pulse-glow">
              <Zap size={14} className="text-ma" />
              <span className="text-xs font-semibold text-foreground">Live Battle — 238 students competing</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}