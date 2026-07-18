'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Users, BookOpen, Target, Trophy, Video, TrendingUp } from 'lucide-react';

const stats = [
  { key: 'stat-students', value: 40000, suffix: '+', label: 'Active Students', icon: Users, color: 'text-primary', bg: 'bg-secondary' },
  { key: 'stat-mcq', value: 15000, suffix: '+', label: 'MCQs with Explanations', icon: Target, color: 'text-bio', bg: 'bg-bio-light' },
  { key: 'stat-accuracy', value: 92, suffix: '%', label: 'Avg. Accuracy Improvement', icon: TrendingUp, color: 'text-accent', bg: 'bg-success-light' },
  { key: 'stat-notes', value: 1200, suffix: '+', label: 'Premium Chapter Notes', icon: BookOpen, color: 'text-chem', bg: 'bg-chem-light' },
  { key: 'stat-videos', value: 850, suffix: '+', label: 'Video Lectures', icon: Video, color: 'text-physics', bg: 'bg-physics-light' },
  { key: 'stat-rank', value: 98, suffix: '%', label: 'Students Improved Rank', icon: Trophy, color: 'text-ma', bg: 'bg-ma-light' },
];

function useCountUp(target: number, active: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = 0;
    const step = target / 60;
    const id = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(id);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(id);
  }, [target, active]);
  return count;
}

function StatCard({ stat, active }: { stat: typeof stats[0]; active: boolean }) {
  const count = useCountUp(stat.value, active);
  return (
    <div className="card-base card-hover flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
        <stat.icon size={22} className={stat.color} />
      </div>
      <div>
        <p className={`text-2xl font-bold tabular-nums ${stat.color}`}>
          {count.toLocaleString()}{stat.suffix}
        </p>
        <p className="text-sm text-muted-foreground font-medium mt-0.5">{stat.label}</p>
      </div>
    </div>
  );
}

export default function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setActive(true); },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-16 bg-muted/40">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="text-center mb-10">
          <p className="section-label mb-2">Platform Impact</p>
          <h2 className="text-hero-md text-foreground">Numbers That Speak</h2>
          <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
            Trusted by thousands of Nepal CEE aspirants every year
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-6 gap-4">
          {stats.map((stat) => (
            <StatCard key={stat.key} stat={stat} active={active} />
          ))}
        </div>
      </div>
    </section>
  );
}