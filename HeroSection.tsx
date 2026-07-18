'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Zap, Users, BookOpen, Star, Play, ChevronRight } from 'lucide-react';

import { createClient } from '@/lib/supabase/client';

interface HeroStats {
  totalStudents: number;
  totalQuestions: number;
  loading: boolean;
}

const HeroSection = () => {
  const [stats, setStats] = useState<HeroStats>({ totalStudents: 0, totalQuestions: 0, loading: true });

  useEffect(() => {
    const fetchStats = async () => {
      const supabase = createClient();
      const [studentsRes, questionsRes] = await Promise.all([
        supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
        supabase.from('questions').select('id', { count: 'exact', head: true }).eq('is_published', true),
      ]);
      setStats({
        totalStudents: studentsRes.count ?? 40000,
        totalQuestions: questionsRes.count ?? 14000,
        loading: false,
      });
    };
    fetchStats();
  }, []);

  const displayStudents = stats.loading ? '40,000+' : `${(stats.totalStudents || 40000).toLocaleString()}+`;
  const displayQuestions = stats.loading ? '14,000+' : `${(stats.totalQuestions || 14000).toLocaleString()}+`;

  return (
    <section className="relative overflow-hidden bg-background pt-16 pb-24">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-bio/5 pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="relative max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              Nepal&apos;s #1 CEE Preparation Platform
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-foreground leading-tight mb-6">
              Crack CEE 2026{' '}
              <span className="text-primary">with Confidence</span>
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg">
              Premium notes, video lectures, 14,000+ MCQs, live classes, and AI-powered study tools — everything you need to secure your medical seat.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3 mb-10">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-bold text-sm rounded-xl hover:bg-primary-dark transition-colors shadow-primary"
              >
                Start Free Today
                <ArrowRight size={16} />
              </Link>
              <Link
                href="#subjects"
                className="inline-flex items-center gap-2 px-6 py-3 bg-card border border-border text-foreground font-semibold text-sm rounded-xl hover:border-primary/30 hover:text-primary transition-colors"
              >
                <Play size={14} className="text-primary" />
                Explore Subjects
              </Link>
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Users size={16} className="text-primary" />
                </div>
                <div>
                  <p className="text-base font-extrabold text-foreground leading-none">{displayStudents}</p>
                  <p className="text-xs text-muted-foreground">Students</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-bio-light rounded-xl flex items-center justify-center">
                  <Zap size={16} className="text-bio" />
                </div>
                <div>
                  <p className="text-base font-extrabold text-foreground leading-none">{displayQuestions}</p>
                  <p className="text-xs text-muted-foreground">MCQs</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-warning-light rounded-xl flex items-center justify-center">
                  <Star size={16} className="text-warning" />
                </div>
                <div>
                  <p className="text-base font-extrabold text-foreground leading-none">4.9/5</p>
                  <p className="text-xs text-muted-foreground">Rating</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-chem-light rounded-xl flex items-center justify-center">
                  <BookOpen size={16} className="text-chem" />
                </div>
                <div>
                  <p className="text-base font-extrabold text-foreground leading-none">4 Subjects</p>
                  <p className="text-xs text-muted-foreground">Full CEE Coverage</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Feature cards */}
          <div className="hidden lg:grid grid-cols-2 gap-4">
            {[
              { icon: Zap, label: 'MCQ Practice', desc: '14,000+ questions with explanations', color: 'text-primary', bg: 'bg-primary/10' },
              { icon: Play, label: 'Video Lectures', desc: 'Expert-taught HD video content', color: 'text-bio', bg: 'bg-bio-light' },
              { icon: BookOpen, label: 'Premium Notes', desc: 'Chapter-wise PDF notes', color: 'text-chem', bg: 'bg-chem-light' },
              { icon: Users, label: 'Battle Arena', desc: 'Real-time competitive MCQ battles', color: 'text-physics', bg: 'bg-physics-light' },
            ].map((feature) => (
              <div key={feature.label} className="bg-card border border-border rounded-2xl p-5 hover:shadow-card-hover transition-all group">
                <div className={`w-10 h-10 ${feature.bg} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <feature.icon size={18} className={feature.color} />
                </div>
                <p className="text-sm font-bold text-foreground mb-1">{feature.label}</p>
                <p className="text-xs text-muted-foreground">{feature.desc}</p>
                <div className={`flex items-center gap-1 text-xs font-semibold ${feature.color} mt-3`}>
                  <span>Learn more</span>
                  <ChevronRight size={12} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
