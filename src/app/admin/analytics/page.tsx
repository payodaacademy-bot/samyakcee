'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Users, BookOpen, FileText, Zap, TrendingUp, Activity, BarChart2, Loader2 } from 'lucide-react';

interface Stats {
  totalStudents: number;
  totalSubjects: number;
  totalChapters: number;
  totalQuestions: number;
  totalExams: number;
  totalNotes: number;
  totalVideos: number;
  loading: boolean;
}

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<Stats>({ totalStudents: 0, totalSubjects: 0, totalChapters: 0, totalQuestions: 0, totalExams: 0, totalNotes: 0, totalVideos: 0, loading: true });

  useEffect(() => {
    const fetchStats = async () => {
      const supabase = createClient();
      const [students, subjects, chapters, questions, exams, notes, videos] = await Promise.all([
        supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
        supabase.from('subjects').select('id', { count: 'exact', head: true }),
        supabase.from('chapters').select('id', { count: 'exact', head: true }),
        supabase.from('questions').select('id', { count: 'exact', head: true }),
        supabase.from('exams').select('id', { count: 'exact', head: true }),
        supabase.from('notes').select('id', { count: 'exact', head: true }),
        supabase.from('video_lectures').select('id', { count: 'exact', head: true }),
      ]);
      setStats({
        totalStudents: students.count ?? 0,
        totalSubjects: subjects.count ?? 0,
        totalChapters: chapters.count ?? 0,
        totalQuestions: questions.count ?? 0,
        totalExams: exams.count ?? 0,
        totalNotes: notes.count ?? 0,
        totalVideos: videos.count ?? 0,
        loading: false,
      });
    };
    fetchStats();
  }, []);

  const cards = [
    { label: 'Total Students', value: stats.totalStudents, icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Subjects', value: stats.totalSubjects, icon: BookOpen, color: 'text-bio', bg: 'bg-bio-light' },
    { label: 'Chapters', value: stats.totalChapters, icon: BookOpen, color: 'text-chem', bg: 'bg-chem-light' },
    { label: 'Questions', value: stats.totalQuestions, icon: Zap, color: 'text-physics', bg: 'bg-physics-light' },
    { label: 'Exams', value: stats.totalExams, icon: FileText, color: 'text-ma', bg: 'bg-ma-light' },
    { label: 'Notes & PDFs', value: stats.totalNotes, icon: FileText, color: 'text-success', bg: 'bg-success-light' },
    { label: 'Video Lectures', value: stats.totalVideos, icon: Activity, color: 'text-error', bg: 'bg-error-light' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b border-border px-6 py-4 flex items-center gap-3">
        <Link href="/admin" className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><ArrowLeft size={18} /></Link>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center"><BarChart2 size={16} className="text-primary" /></div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Analytics</h1>
            <p className="text-xs text-muted-foreground">Platform overview & statistics</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6">
        {stats.loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 size={28} className="animate-spin text-primary" /></div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-sm font-bold text-foreground mb-3">Content Overview</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {cards.map((card) => (
                  <div key={card.label} className="bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-all">
                    <div className={`w-9 h-9 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
                      <card.icon size={16} className={card.color} />
                    </div>
                    <p className="text-2xl font-extrabold text-foreground">{card.value.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={16} className="text-primary" />
                <h2 className="text-sm font-bold text-foreground">Platform Health</h2>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Content Coverage', value: Math.min(100, Math.round((stats.totalChapters / Math.max(stats.totalSubjects * 10, 1)) * 100)), color: 'bg-primary' },
                  { label: 'Question Bank Depth', value: Math.min(100, Math.round((stats.totalQuestions / Math.max(stats.totalChapters * 20, 1)) * 100)), color: 'bg-bio' },
                  { label: 'Exam Coverage', value: Math.min(100, Math.round((stats.totalExams / Math.max(stats.totalSubjects * 5, 1)) * 100)), color: 'bg-chem' },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">{item.label}</span>
                      <span className="text-xs font-semibold text-foreground">{item.value}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: `${item.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
