'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { BookOpen, FlaskConical, Atom, Calculator, ChevronRight, Search, SlidersHorizontal, TrendingUp } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Subject {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  color: string;
  icon: string;
  is_active: boolean;
  difficulty?: 'easy' | 'medium' | 'hard';
  student_count?: number;
}

const iconMap: Record<string, React.ElementType> = {
  BookOpen,
  FlaskConical,
  Atom,
  Calculator,
};

const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  '#22c55e': { bg: 'bg-bio-light', text: 'text-bio', border: 'border-bio/20' },
  '#f97316': { bg: 'bg-chem-light', text: 'text-chem', border: 'border-chem/20' },
  '#3b82f6': { bg: 'bg-physics-light', text: 'text-physics', border: 'border-physics/20' },
  '#a855f7': { bg: 'bg-ma-light', text: 'text-ma', border: 'border-ma/20' },
  '#6366f1': { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/20' },
};

const difficultyConfig: Record<string, { label: string; color: string }> = {
  easy: { label: 'Easy', color: 'bg-green-100 text-green-700' },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
  hard: { label: 'Hard', color: 'bg-red-100 text-red-700' },
};

const fallbackSubjects: Subject[] = [
  { id: '1', name: 'biology', display_name: 'Biology', description: 'Cell biology, genetics, ecology and more', color: '#22c55e', icon: 'BookOpen', is_active: true, difficulty: 'medium', student_count: 4200 },
  { id: '2', name: 'chemistry', display_name: 'Chemistry', description: 'Organic, inorganic and physical chemistry', color: '#f97316', icon: 'FlaskConical', is_active: true, difficulty: 'hard', student_count: 3800 },
  { id: '3', name: 'physics', display_name: 'Physics', description: 'Mechanics, thermodynamics, optics and more', color: '#3b82f6', icon: 'Atom', is_active: true, difficulty: 'hard', student_count: 3500 },
  { id: '4', name: 'mathematics', display_name: 'Mathematics', description: 'Algebra, calculus, trigonometry and statistics', color: '#a855f7', icon: 'Calculator', is_active: true, difficulty: 'medium', student_count: 2900 },
];

type SortOption = 'default' | 'popularity';
type DifficultyFilter = 'all' | 'easy' | 'medium' | 'hard';

const SubjectsSection = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('default');

  useEffect(() => {
    const fetchSubjects = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('subjects')
        .select('id, name, display_name, description, color, icon, is_active, difficulty, student_count')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error || !data || data.length === 0) {
        setSubjects(fallbackSubjects);
      } else {
        setSubjects(data);
      }
      setLoading(false);
    };
    fetchSubjects();
  }, []);

  const filtered = useMemo(() => {
    let result = [...subjects];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.display_name.toLowerCase().includes(q) ||
          (s.description ?? '').toLowerCase().includes(q)
      );
    }

    if (difficulty !== 'all') {
      result = result.filter((s) => s.difficulty === difficulty);
    }

    if (sortBy === 'popularity') {
      result.sort((a, b) => (b.student_count ?? 0) - (a.student_count ?? 0));
    }

    return result;
  }, [subjects, search, difficulty, sortBy]);

  const getColors = (color: string) => {
    return colorMap[color] ?? { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/20' };
  };

  return (
    <section id="subjects" className="py-20 bg-background">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-block text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full mb-4 tracking-wider uppercase">
            Subjects
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-4">
            Master Every CEE Subject
          </h2>
          <p className="text-base text-muted-foreground max-w-xl mx-auto">
            Comprehensive coverage of all subjects tested in Nepal&apos;s CEE medical entrance exam.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search subjects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>

          {/* Difficulty Filter */}
          <div className="relative">
            <SlidersHorizontal size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as DifficultyFilter)}
              className="pl-9 pr-8 py-2.5 text-sm bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition appearance-none cursor-pointer"
            >
              <option value="all">All Levels</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          {/* Sort */}
          <div className="relative">
            <TrendingUp size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="pl-9 pr-8 py-2.5 text-sm bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition appearance-none cursor-pointer"
            >
              <option value="default">Default Order</option>
              <option value="popularity">Most Popular</option>
            </select>
          </div>
        </div>

        {/* Subjects Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-6 animate-pulse">
                <div className="w-12 h-12 bg-muted rounded-xl mb-4" />
                <div className="h-5 bg-muted rounded w-2/3 mb-2" />
                <div className="h-4 bg-muted rounded w-full mb-1" />
                <div className="h-4 bg-muted rounded w-4/5" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-sm">No subjects match your search or filters.</p>
            <button
              onClick={() => { setSearch(''); setDifficulty('all'); setSortBy('default'); }}
              className="mt-3 text-primary text-sm font-medium hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map((subject) => {
              const colors = getColors(subject.color);
              const IconComponent = iconMap[subject.icon] ?? BookOpen;
              const diff = subject.difficulty ? difficultyConfig[subject.difficulty] : null;
              return (
                <div
                  key={subject.id}
                  className={`group bg-card border ${colors.border} rounded-2xl p-6 hover:shadow-card-hover transition-all duration-300 cursor-pointer`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <IconComponent size={22} className={colors.text} />
                    </div>
                    {diff && (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${diff.color}`}>
                        {diff.label}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-2">{subject.display_name}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {subject.description ?? `Comprehensive ${subject.display_name} preparation for CEE.`}
                  </p>
                  {subject.student_count != null && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                      <TrendingUp size={12} />
                      <span>{subject.student_count.toLocaleString()} students</span>
                    </div>
                  )}
                  <div className={`flex items-center gap-1 text-xs font-semibold ${colors.text}`}>
                    <span>Explore chapters</span>
                    <ChevronRight size={13} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CTA */}
        <div className="text-center mt-12">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold text-sm rounded-xl hover:bg-primary-dark transition-colors"
          >
            Start Studying Free
            <ChevronRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default SubjectsSection;
