'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { LayoutDashboard, Users, BookOpen, Video, FileText, Zap, Swords, CreditCard, BarChart2, TrendingUp, TrendingDown, ChevronRight, Activity, Shield, MessageSquare, Radio, LogOut, Menu, Sun, Moon, KeyRound, Upload } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';
import { createClient } from '@/lib/supabase/client';

interface StatCard {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ElementType;
  color: string;
  bg: string;
}

const stats: StatCard[] = [
  { label: 'Total Students', value: '12,847', change: '+234 this week', trend: 'up', icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
  { label: 'Active Today', value: '3,421', change: '+12% vs yesterday', trend: 'up', icon: Activity, color: 'text-success', bg: 'bg-success-light' },
  { label: 'Pro Subscribers', value: '2,108', change: '+89 this month', trend: 'up', icon: CreditCard, color: 'text-chem', bg: 'bg-chem-light' },
  { label: 'Revenue (NPR)', value: '8,42,500', change: '+18% vs last month', trend: 'up', icon: TrendingUp, color: 'text-bio', bg: 'bg-bio-light' },
  { label: 'Active Battles', value: '147', change: 'Right now', trend: 'neutral', icon: Swords, color: 'text-ma', bg: 'bg-ma-light' },
  { label: 'MCQs Published', value: '14,280', change: '+120 this week', trend: 'up', icon: Zap, color: 'text-physics', bg: 'bg-physics-light' },
  { label: 'Support Tickets', value: '23', change: '5 unresolved', trend: 'down', icon: MessageSquare, color: 'text-error', bg: 'bg-error-light' },
  { label: 'Upcoming Classes', value: '8', change: 'Next 7 days', trend: 'neutral', icon: Radio, color: 'text-primary', bg: 'bg-primary/10' },
];

const navItems = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard, key: 'admin-overview' },
  { label: 'Content', key: 'admin-content', icon: BookOpen, children: [
    { label: 'Subjects & Chapters', href: '/admin/subjects', icon: BookOpen, key: 'admin-subjects' },
    { label: 'Chapters', href: '/admin/chapters', icon: BookOpen, key: 'admin-chapters' },
  ]},
  { label: 'Upload Manager', href: '/admin/uploads', icon: Upload, key: 'admin-uploads' },
  { label: 'Questions', href: '/admin/questions', icon: Zap, key: 'admin-questions', badge: '14,280' },
  { label: 'Exams', href: '/admin/exams', icon: FileText, key: 'admin-exams' },
  { label: 'AI Tools', key: 'admin-ai', icon: Zap, children: [
    { label: 'Content Quality Review', href: '/admin/ai-review', icon: Shield, key: 'admin-ai-review' },
    { label: 'MCQ Generator', href: '/mcq-generator', icon: Zap, key: 'admin-mcq-gen' },
  ]},
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart2, key: 'admin-analytics' },
  { label: 'Activation Codes', href: '/admin/activation-codes', icon: KeyRound, key: 'admin-activation-codes' },
];

const recentActivity = [
  { id: 'act-1', type: 'user', text: 'New registration: Sita Rai (Kathmandu)', time: '2m ago', icon: Users, color: 'text-primary' },
  { id: 'act-2', type: 'payment', text: 'Pro subscription purchased — NPR 2,499', time: '5m ago', icon: CreditCard, color: 'text-success' },
  { id: 'act-3', type: 'content', text: 'New notes published: Cell Biology Ch.3', time: '12m ago', icon: FileText, color: 'text-bio' },
  { id: 'act-4', type: 'battle', text: 'Battle completed: Priya vs Aarav (Biology)', time: '18m ago', icon: Swords, color: 'text-chem' },
  { id: 'act-5', type: 'support', text: 'Support ticket #247 opened — Payment issue', time: '25m ago', icon: MessageSquare, color: 'text-error' },
  { id: 'act-6', type: 'content', text: 'Video uploaded: Genetics Lecture #5', time: '1h ago', icon: Video, color: 'text-physics' },
  { id: 'act-7', type: 'user', text: 'Teacher account created: Dr. Ramesh Poudel', time: '2h ago', icon: Shield, color: 'text-ma' },
];

const quickActions = [
  { label: 'Add MCQ', href: '/admin/questions', icon: Zap, color: 'text-primary', bg: 'bg-primary/10' },
  { label: 'Add Chapter', href: '/admin/chapters', icon: BookOpen, color: 'text-bio', bg: 'bg-bio-light' },
  { label: 'Create Exam', href: '/admin/exams', icon: FileText, color: 'text-chem', bg: 'bg-chem-light' },
  { label: 'Upload Files', href: '/admin/uploads', icon: Upload, color: 'text-error', bg: 'bg-error-light' },
  { label: 'AI Review', href: '/admin/ai-review', icon: Shield, color: 'text-physics', bg: 'bg-physics-light' },
  { label: 'Activation Codes', href: '/admin/activation-codes', icon: KeyRound, color: 'text-ma', bg: 'bg-ma-light' },
];

interface KpiData {
  totalQuestions: number;
  totalExams: number;
  totalStudents: number;
  loading: boolean;
}

export default function AdminDashboardClient() {
  const [isDark, setIsDark] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['admin-content']));
  const [kpi, setKpi] = useState<KpiData>({ totalQuestions: 0, totalExams: 0, totalStudents: 0, loading: true });

  useEffect(() => {
    const fetchKpi = async () => {
      const supabase = createClient();
      const [questionsRes, examsRes, studentsRes] = await Promise.all([
        supabase.from('questions').select('id', { count: 'exact', head: true }),
        supabase.from('exams').select('id', { count: 'exact', head: true }),
        supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
      ]);
      setKpi({
        totalQuestions: questionsRes.count ?? 0,
        totalExams: examsRes.count ?? 0,
        totalStudents: studentsRes.count ?? 0,
        loading: false,
      });
    };
    fetchKpi();
  }, []);

  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) => {
      const n = new Set(prev);
      n.has(key) ? n.delete(key) : n.add(key);
      return n;
    });
  };

  React.useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDark]);

  const Sidebar = () => (
    <aside className="flex flex-col w-60 bg-card border-r border-border h-full">
      <div className="flex items-center h-16 px-4 border-b border-border shrink-0">
        <Link href="/" className="flex items-center gap-2.5">
          <AppLogo size={32} />
          <div className="flex flex-col leading-none">
            <span className="font-extrabold text-sm text-foreground tracking-tight">Samyak Admin</span>
            <span className="text-xs font-medium text-error">Control Panel</span>
          </div>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-3 px-2 scrollbar-hide">
        {navItems.map((item) => {
          if ('children' in item && item.children) {
            const expanded = expandedGroups.has(item.key);
            return (
              <div key={item.key}>
                <button
                  onClick={() => toggleGroup(item.key)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg mb-0.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <item.icon size={17} className="shrink-0" />
                  <span className="text-sm flex-1 text-left">{item.label}</span>
                  <ChevronRight size={13} className={`transition-transform ${expanded ? 'rotate-90' : ''}`} />
                </button>
                {expanded && (
                  <div className="ml-4 pl-2 border-l border-border mb-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.key}
                        href={child.href}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-lg mb-0.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-sm"
                      >
                        <child.icon size={14} className="shrink-0" />
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }
          return (
            <Link
              key={item.key}
              href={(item as { href: string }).href}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg mb-0.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <item.icon size={17} className="shrink-0" />
              <span className="text-sm flex-1">{item.label}</span>
              {(item as { badge?: string }).badge && (
                <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">{(item as { badge?: string }).badge}</span>
              )}
            </Link>
          );
        })}
      </div>

      <div className="border-t border-border p-2 shrink-0">
        <div className="flex items-center gap-2.5 px-2.5 py-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-error/10 flex items-center justify-center text-error font-bold text-sm">A</div>
          <div>
            <p className="text-xs font-semibold text-foreground">Admin User</p>
            <p className="text-xs text-muted-foreground">Super Admin</p>
          </div>
        </div>
        <button className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-error hover:bg-error-light transition-colors">
          <LogOut size={16} />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-10 w-60">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 sm:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted">
              <Menu size={18} />
            </button>
            <div>
              <p className="text-sm font-bold text-foreground">Admin Dashboard</p>
              <p className="text-xs text-muted-foreground">Samyak CEE Mastery · Platform Overview</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-success-light text-success text-xs font-semibold px-2.5 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
              All Systems Operational
            </div>
            <button onClick={() => setIsDark(!isDark)} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted">
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-screen-2xl mx-auto">
            {/* Page header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-xl font-bold text-foreground">Platform Overview</h1>
                <p className="text-sm text-muted-foreground mt-0.5">Tuesday, 15 July 2026 · Real-time data</p>
              </div>
              <div className="flex gap-2">
                {quickActions.slice(0, 3).map((a) => (
                  <Link key={a.label} href={a.href} className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-card border border-border rounded-xl text-xs font-semibold text-foreground hover:border-primary/30 hover:text-primary transition-colors">
                    <a.icon size={13} className={a.color} />
                    {a.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* KPI Cards */}
            <div className="mb-6">
              <h2 className="text-sm font-bold text-foreground mb-3">Key Metrics</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Total Questions KPI */}
                <div className="bg-card border border-border rounded-2xl p-5 hover:shadow-card-hover transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Zap size={20} className="text-primary" />
                    </div>
                    <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">MCQ Bank</span>
                  </div>
                  <p className="text-3xl font-black text-foreground leading-none mb-1">
                    {kpi.loading ? <span className="inline-block w-16 h-8 bg-muted animate-pulse rounded" /> : kpi.totalQuestions.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">Total Questions</p>
                  <Link
                    href="/admin/questions"
                    className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold rounded-xl transition-colors"
                  >
                    <Zap size={13} />
                    Manage Questions
                    <ChevronRight size={13} />
                  </Link>
                </div>

                {/* Total Exams KPI */}
                <div className="bg-card border border-border rounded-2xl p-5 hover:shadow-card-hover transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-physics-light flex items-center justify-center">
                      <FileText size={20} className="text-physics" />
                    </div>
                    <span className="text-xs font-semibold text-physics bg-physics-light px-2 py-1 rounded-full">Mock Tests</span>
                  </div>
                  <p className="text-3xl font-black text-foreground leading-none mb-1">
                    {kpi.loading ? <span className="inline-block w-16 h-8 bg-muted animate-pulse rounded" /> : kpi.totalExams.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">Total Exams</p>
                  <Link
                    href="/admin/exams"
                    className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-physics-light hover:bg-physics/20 text-physics text-xs font-semibold rounded-xl transition-colors"
                  >
                    <FileText size={13} />
                    Manage Exams
                    <ChevronRight size={13} />
                  </Link>
                </div>

                {/* Total Students KPI */}
                <div className="bg-card border border-border rounded-2xl p-5 hover:shadow-card-hover transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-success-light flex items-center justify-center">
                      <Users size={20} className="text-success" />
                    </div>
                    <span className="text-xs font-semibold text-success bg-success-light px-2 py-1 rounded-full">Registered</span>
                  </div>
                  <p className="text-3xl font-black text-foreground leading-none mb-1">
                    {kpi.loading ? <span className="inline-block w-16 h-8 bg-muted animate-pulse rounded" /> : kpi.totalStudents.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">Total Students</p>
                  <Link
                    href="/admin/analytics"
                    className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-success-light hover:bg-success/20 text-success text-xs font-semibold rounded-xl transition-colors"
                  >
                    <Users size={13} />
                    View Analytics
                    <ChevronRight size={13} />
                  </Link>
                </div>
              </div>
            </div>

            {/* Content Management Cards */}
            <div className="mb-6">
              <h2 className="text-sm font-bold text-foreground mb-3">Content Management</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Subjects', desc: 'Manage CEE subjects', href: '/admin/subjects', icon: BookOpen, color: 'text-bio', bg: 'bg-bio-light' },
                  { label: 'Chapters', desc: 'Organize syllabus chapters', href: '/admin/chapters', icon: BookOpen, color: 'text-chem', bg: 'bg-chem-light' },
                  { label: 'Questions', desc: 'MCQ bank & bulk import', href: '/admin/questions', icon: Zap, color: 'text-primary', bg: 'bg-primary/10' },
                  { label: 'Exams', desc: 'Mock tests & full CEE', href: '/admin/exams', icon: FileText, color: 'text-physics', bg: 'bg-physics-light' },
                  { label: 'Activation Codes', desc: 'Generate plan codes', href: '/admin/activation-codes', icon: KeyRound, color: 'text-ma', bg: 'bg-ma-light' },
                  { label: 'Upload Manager', desc: 'Notes, videos, materials', href: '/admin/uploads', icon: Upload, color: 'text-error', bg: 'bg-error-light' },
                ].map((item) => (
                  <Link key={item.label} href={item.href} className="bg-card border border-border rounded-2xl p-4 hover:border-primary/30 hover:shadow-card-hover transition-all group">
                    <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center mb-3`}>
                      <item.icon size={18} className={item.color} />
                    </div>
                    <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{item.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                  </Link>
                ))}
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-card border border-border rounded-2xl p-4 hover:shadow-card-hover transition-all">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
                      <stat.icon size={17} className={stat.color} />
                    </div>
                    {stat.trend !== 'neutral' && (
                      stat.trend === 'up'
                        ? <TrendingUp size={14} className="text-success" />
                        : <TrendingDown size={14} className="text-error" />
                    )}
                  </div>
                  <p className="text-xl font-black text-foreground leading-none">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                  <p className={`text-xs mt-0.5 font-medium ${stat.trend === 'up' ? 'text-success' : stat.trend === 'down' ? 'text-error' : 'text-muted-foreground'}`}>
                    {stat.change}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-5">
              {/* Recent activity */}
              <div className="lg:col-span-2 bg-card border border-border rounded-2xl">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                  <h2 className="font-bold text-sm text-foreground">Recent Activity</h2>
                  <button className="text-xs text-primary font-semibold hover:underline">View all</button>
                </div>
                <div className="divide-y divide-border">
                  {recentActivity.map((act) => (
                    <div key={act.id} className="flex items-start gap-3 px-5 py-3 hover:bg-muted/30 transition-colors">
                      <div className={`w-7 h-7 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5`}>
                        <act.icon size={13} className={act.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground leading-snug">{act.text}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{act.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right column */}
              <div className="space-y-4">
                {/* Quick actions */}
                <div className="bg-card border border-border rounded-2xl p-4">
                  <h2 className="font-bold text-sm text-foreground mb-3">Quick Actions</h2>
                  <div className="grid grid-cols-2 gap-2">
                    {quickActions.map((a) => (
                      <Link
                        key={a.label}
                        href={a.href}
                        className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors group"
                      >
                        <div className={`w-8 h-8 rounded-lg ${a.bg} flex items-center justify-center`}>
                          <a.icon size={15} className={a.color} />
                        </div>
                        <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors text-center leading-tight">{a.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Platform health */}
                <div className="bg-card border border-border rounded-2xl p-4">
                  <h2 className="font-bold text-sm text-foreground mb-3">Platform Health</h2>
                  <div className="space-y-2.5">
                    {[
                      { label: 'Database', status: 'Healthy', color: 'text-success', bg: 'bg-success-light' },
                      { label: 'Storage', status: 'Healthy', color: 'text-success', bg: 'bg-success-light' },
                      { label: 'Auth Service', status: 'Healthy', color: 'text-success', bg: 'bg-success-light' },
                      { label: 'Realtime', status: 'Healthy', color: 'text-success', bg: 'bg-success-light' },
                      { label: 'Payment Gateway', status: 'Sandbox', color: 'text-warning', bg: 'bg-warning-light' },
                    ].map((s) => (
                      <div key={s.label} className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{s.label}</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.bg} ${s.color}`}>{s.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
