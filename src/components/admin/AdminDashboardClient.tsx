'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { LayoutDashboard, Users, BookOpen, FileText, Zap, CreditCard, BarChart2, ChevronRight, Activity, Shield, MessageSquare, Radio, LogOut, Menu, Sun, Moon, KeyRound, Upload } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface StatCard {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ElementType;
  color: string;
  bg: string;
}

const navItems = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard, key: 'admin-overview' },
  { label: 'Content', key: 'admin-content', icon: BookOpen, children: [
    { label: 'Subjects', href: '/admin/subjects', icon: BookOpen, key: 'admin-subjects' },
    { label: 'Chapters', href: '/admin/chapters', icon: BookOpen, key: 'admin-chapters' },
  ]},
  { label: 'Upload Manager', href: '/admin/uploads', icon: Upload, key: 'admin-uploads' },
  { label: 'Questions', href: '/admin/questions', icon: Zap, key: 'admin-questions' },
  { label: 'Exams', href: '/admin/exams', icon: FileText, key: 'admin-exams' },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart2, key: 'admin-analytics' },
  { label: 'Activation Codes', href: '/admin/activation-codes', icon: KeyRound, key: 'admin-activation-codes' },
];

const quickActions = [
  { label: 'Add MCQ', href: '/admin/questions', icon: Zap, color: 'text-primary', bg: 'bg-primary/10' },
  { label: 'Add Chapter', href: '/admin/chapters', icon: BookOpen, color: 'text-bio', bg: 'bg-bio-light' },
  { label: 'Create Exam', href: '/admin/exams', icon: FileText, color: 'text-chem', bg: 'bg-chem-light' },
  { label: 'Upload Files', href: '/admin/uploads', icon: Upload, color: 'text-error', bg: 'bg-error-light' },
  { label: 'AI Review', href: '/admin/ai-review', icon: Shield, color: 'text-physics', bg: 'bg-physics-light' },
  { label: 'Activation Codes', href: '/admin/activation-codes', icon: KeyRound, color: 'text-ma', bg: 'bg-ma-light' },
];

interface DashboardData {
  totalQuestions: number;
  totalExams: number;
  totalStudents: number;
  totalSubjects: number;
  totalChapters: number;
  proSubscribers: number;
  recentUsers: { id: string; full_name: string | null; created_at: string }[];
  loading: boolean;
}

export default function AdminDashboardClient() {
  const router = useRouter();
  const { signOut, profile } = useAuth();
  const [isDark, setIsDark] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['admin-content']));
  const [data, setData] = useState<DashboardData>({
    totalQuestions: 0, totalExams: 0, totalStudents: 0,
    totalSubjects: 0, totalChapters: 0, proSubscribers: 0,
    recentUsers: [], loading: true,
  });

  useEffect(() => {
    const fetchDashboard = async () => {
      const supabase = createClient();
      const [questionsRes, examsRes, studentsRes, subjectsRes, chaptersRes, proRes, recentUsersRes] = await Promise.all([
        supabase.from('questions').select('id', { count: 'exact', head: true }),
        supabase.from('exams').select('id', { count: 'exact', head: true }),
        supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
        supabase.from('subjects').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('chapters').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('user_profiles').select('id', { count: 'exact', head: true }).eq('subscription_plan', 'pro'),
        supabase.from('user_profiles').select('id, full_name, created_at').order('created_at', { ascending: false }).limit(5),
      ]);
      setData({
        totalQuestions: questionsRes.count ?? 0,
        totalExams: examsRes.count ?? 0,
        totalStudents: studentsRes.count ?? 0,
        totalSubjects: subjectsRes.count ?? 0,
        totalChapters: chaptersRes.count ?? 0,
        proSubscribers: proRes.count ?? 0,
        recentUsers: recentUsersRes.data ?? [],
        loading: false,
      });
    };
    fetchDashboard();
  }, []);

  const stats: StatCard[] = [
    { label: 'Total Students', value: data.loading ? '…' : data.totalStudents.toLocaleString(), change: 'Registered users', trend: 'up', icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Pro Subscribers', value: data.loading ? '…' : data.proSubscribers.toLocaleString(), change: 'Active pro plans', trend: 'up', icon: CreditCard, color: 'text-chem', bg: 'bg-chem-light' },
    { label: 'Active Subjects', value: data.loading ? '…' : data.totalSubjects.toLocaleString(), change: 'CEE subjects', trend: 'neutral', icon: BookOpen, color: 'text-bio', bg: 'bg-bio-light' },
    { label: 'Total Chapters', value: data.loading ? '…' : data.totalChapters.toLocaleString(), change: 'Syllabus chapters', trend: 'up', icon: Activity, color: 'text-success', bg: 'bg-success-light' },
    { label: 'MCQs Published', value: data.loading ? '…' : data.totalQuestions.toLocaleString(), change: 'Question bank', trend: 'up', icon: Zap, color: 'text-physics', bg: 'bg-physics-light' },
    { label: 'Mock Exams', value: data.loading ? '…' : data.totalExams.toLocaleString(), change: 'Available tests', trend: 'up', icon: FileText, color: 'text-ma', bg: 'bg-ma-light' },
    { label: 'Upcoming Classes', value: '—', change: 'Next 7 days', trend: 'neutral', icon: Radio, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Support Tickets', value: '—', change: 'Open tickets', trend: 'neutral', icon: MessageSquare, color: 'text-error', bg: 'bg-error-light' },
  ];

  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) => {
      const n = new Set(prev);
      n.has(key) ? n.delete(key) : n.add(key);
      return n;
    });
  };

  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDark]);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/login');
  };

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
            </Link>
          );
        })}
      </div>

      <div className="border-t border-border p-2 shrink-0">
        <div className="flex items-center gap-2.5 px-2.5 py-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-error/10 flex items-center justify-center text-error font-bold text-sm">
            {profile?.full_name?.[0]?.toUpperCase() ?? 'A'}
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground">{profile?.full_name ?? 'Admin User'}</p>
            <p className="text-xs text-muted-foreground">Super Admin</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-error hover:bg-error-light transition-colors"
        >
          <LogOut size={16} />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <div className="hidden lg:flex shrink-0">
        <Sidebar />
      </div>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-10 w-60">
            <Sidebar />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
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

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-screen-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-xl font-bold text-foreground">Platform Overview</h1>
                <p className="text-sm text-muted-foreground mt-0.5">Samyak CEE Mastery · Live data from Supabase</p>
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

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-card border border-border rounded-2xl p-4 hover:shadow-md transition-all">
                  <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                    <stat.icon size={16} className={stat.color} />
                  </div>
                  <p className="text-2xl font-extrabold text-foreground">{stat.value}</p>
                  <p className="text-xs font-semibold text-foreground mt-0.5">{stat.label}</p>
                  <p className="text-xs text-muted-foreground">{stat.change}</p>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-2xl p-5">
                <h2 className="text-sm font-bold text-foreground mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {quickActions.map((action) => (
                    <Link key={action.label} href={action.href} className="flex flex-col items-center gap-2 p-3 rounded-xl border border-border hover:border-primary/30 hover:bg-muted/30 transition-all text-center">
                      <div className={`w-9 h-9 rounded-xl ${action.bg} flex items-center justify-center`}>
                        <action.icon size={16} className={action.color} />
                      </div>
                      <span className="text-xs font-semibold text-foreground">{action.label}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="bg-card border border-border rounded-2xl p-5">
                <h2 className="text-sm font-bold text-foreground mb-4">Recent Registrations</h2>
                {data.loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : data.recentUsers.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No students yet</p>
                ) : (
                  <div className="space-y-3">
                    {data.recentUsers.map((user) => (
                      <div key={user.id} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                          {user.full_name?.[0]?.toUpperCase() ?? '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{user.full_name ?? 'Anonymous'}</p>
                          <p className="text-xs text-muted-foreground">{new Date(user.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
