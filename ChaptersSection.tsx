'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { ChevronRight, Search, SlidersHorizontal, TrendingUp, Layers } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Chapter {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  subject_id: string;
  subject_name?: string;
  subject_color?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  student_count?: number;
  is_active: boolean;
}

const difficultyConfig: Record<string, { label: string; color: string }> = {
  easy: { label: 'Easy', color: 'bg-green-100 text-green-700' },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
  hard: { label: 'Hard', color: 'bg-red-100 text-red-700' },
};

const subjectColorMap: Record<string, { bg: string; text: string; border: string }> = {
  '#22c55e': { bg: 'bg-bio-light', text: 'text-bio', border: 'border-bio/20' },
  '#f97316': { bg: 'bg-chem-light', text: 'text-chem', border: 'border-chem/20' },
  '#3b82f6': { bg: 'bg-physics-light', text: 'text-physics', border: 'border-physics/20' },
  '#a855f7': { bg: 'bg-ma-light', text: 'text-ma', border: 'border-ma/20' },
  '#6366f1': { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/20' },
};

const fallbackChapters: Chapter[] = [
  { id: '1', name: 'cell-biology', display_name: 'Cell Biology', description: 'Structure and function of cells, organelles, and membranes', subject_id: '1', subject_name: 'Biology', subject_color: '#22c55e', difficulty: 'medium', student_count: 3100, is_active: true },
  { id: '2', name: 'genetics', display_name: 'Genetics', description: 'Heredity, DNA replication, and gene expression', subject_id: '1', subject_name: 'Biology', subject_color: '#22c55e', difficulty: 'hard', student_count: 2800, is_active: true },
  { id: '3', name: 'organic-chemistry', display_name: 'Organic Chemistry', description: 'Hydrocarbons, functional groups, and reactions', subject_id: '2', subject_name: 'Chemistry', subject_color: '#f97316', difficulty: 'hard', student_count: 2600, is_active: true },
  { id: '4', name: 'mechanics', display_name: 'Mechanics', description: 'Newton\'s laws, kinematics, and dynamics', subject_id: '3', subject_name: 'Physics', subject_color: '#3b82f6', difficulty: 'medium', student_count: 2400, is_active: true },
  { id: '5', name: 'thermodynamics', display_name: 'Thermodynamics', description: 'Heat, temperature, and laws of thermodynamics', subject_id: '3', subject_name: 'Physics', subject_color: '#3b82f6', difficulty: 'hard', student_count: 2100, is_active: true },
  { id: '6', name: 'algebra', display_name: 'Algebra', description: 'Equations, inequalities, and algebraic structures', subject_id: '4', subject_name: 'Mathematics', subject_color: '#a855f7', difficulty: 'easy', student_count: 1900, is_active: true },
  { id: '7', name: 'calculus', display_name: 'Calculus', description: 'Limits, derivatives, and integrals', subject_id: '4', subject_name: 'Mathematics', subject_color: '#a855f7', difficulty: 'hard', student_count: 1700, is_active: true },
  { id: '8', name: 'inorganic-chemistry', display_name: 'Inorganic Chemistry', description: 'Periodic table, bonding, and coordination compounds', subject_id: '2', subject_name: 'Chemistry', subject_color: '#f97316', difficulty: 'medium', student_count: 1500, is_active: true },
];

type SortOption = 'default' | 'popularity';
type DifficultyFilter = 'all' | 'easy' | 'medium' | 'hard';

const ChaptersSection = () => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('default');

  useEffect(() => {
    const fetchChapters = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('chapters')
        .select('id, name, display_name, description, subject_id, difficulty, student_count, is_active, subjects(name, display_name, color)')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .limit(12);

      if (error || !data || data.length === 0) {
        setChapters(fallbackChapters);
      } else {
        const mapped: Chapter[] = data.map((c: any) => ({
          id: c.id,
          name: c.name,
          display_name: c.display_name,
          description: c.description,
          subject_id: c.subject_id,
          subject_name: c.subjects?.display_name ?? c.subjects?.name,
          subject_color: c.subjects?.color,
          difficulty: c.difficulty,
          student_count: c.student_count,
          is_active: c.is_active,
        }));
        setChapters(mapped);
      }
      setLoading(false);
    };
    fetchChapters();
  }, []);

  const filtered = useMemo(() => {
    let result = [...chapters];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.display_name.toLowerCase().includes(q) ||
          (c.description ?? '').toLowerCase().includes(q) ||
          (c.subject_name ?? '').toLowerCase().includes(q)
      );
    }

    if (difficulty !== 'all') {
      result = result.filter((c) => c.difficulty === difficulty);
    }

    if (sortBy === 'popularity') {
      result.sort((a, b) => (b.student_count ?? 0) - (a.student_count ?? 0));
    }

    return result;
  }, [chapters, search, difficulty, sortBy]);

  const getColors = (color?: string) => {
    if (!color) return { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/20' };
    return subjectColorMap[color] ?? { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/20' };
  };

  return (
    <section id="chapters" className="py-20 bg-muted/30">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-block text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full mb-4 tracking-wider uppercase">
            Chapters
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-4">
            Explore All Chapters
          </h2>
          <p className="text-base text-muted-foreground max-w-xl mx-auto">
            Dive deep into every chapter with structured notes, practice questions, and video explanations.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search chapters or subjects..."
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

        {/* Chapters Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-5 animate-pulse">
                <div className="h-4 bg-muted rounded w-1/3 mb-3" />
                <div className="h-5 bg-muted rounded w-2/3 mb-2" />
                <div className="h-4 bg-muted rounded w-full mb-1" />
                <div className="h-4 bg-muted rounded w-4/5" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-sm">No chapters match your search or filters.</p>
            <button
              onClick={() => { setSearch(''); setDifficulty('all'); setSortBy('default'); }}
              className="mt-3 text-primary text-sm font-medium hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filtered.map((chapter) => {
              const colors = getColors(chapter.subject_color);
              const diff = chapter.difficulty ? difficultyConfig[chapter.difficulty] : null;
              return (
                <div
                  key={chapter.id}
                  className={`group bg-card border ${colors.border} rounded-2xl p-5 hover:shadow-card-hover transition-all duration-300 cursor-pointer`}
                >
                  {/* Subject badge */}
                  {chapter.subject_name && (
                    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-3 ${colors.bg} ${colors.text}`}>
                      {chapter.subject_name}
                    </span>
                  )}

                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-bold text-foreground leading-snug flex-1 pr-2">
                      {chapter.display_name}
                    </h3>
                    {diff && (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${diff.color}`}>
                        {diff.label}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed mb-4 line-clamp-2">
                    {chapter.description ?? `Study ${chapter.display_name} for CEE preparation.`}
                  </p>

                  <div className="flex items-center justify-between">
                    {chapter.student_count != null && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <TrendingUp size={11} />
                        <span>{chapter.student_count.toLocaleString()} students</span>
                      </div>
                    )}
                    <div className={`flex items-center gap-1 text-xs font-semibold ${colors.text} ml-auto`}>
                      <span>Study now</span>
                      <ChevronRight size={12} />
                    </div>
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
            <Layers size={15} />
            View All Chapters
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ChaptersSection;
