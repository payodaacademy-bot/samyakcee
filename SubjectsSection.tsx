'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, FlaskConical, Atom, Calculator, ChevronRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Subject {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  color: string;
  icon: string;
  is_active: boolean;
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

const fallbackSubjects: Subject[] = [
  { id: '1', name: 'biology', display_name: 'Biology', description: 'Cell biology, genetics, ecology and more', color: '#22c55e', icon: 'BookOpen', is_active: true },
  { id: '2', name: 'chemistry', display_name: 'Chemistry', description: 'Organic, inorganic and physical chemistry', color: '#f97316', icon: 'FlaskConical', is_active: true },
  { id: '3', name: 'physics', display_name: 'Physics', description: 'Mechanics, thermodynamics, optics and more', color: '#3b82f6', icon: 'Atom', is_active: true },
  { id: '4', name: 'mathematics', display_name: 'Mathematics', description: 'Algebra, calculus, trigonometry and statistics', color: '#a855f7', icon: 'Calculator', is_active: true },
];

const SubjectsSection = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('subjects')
        .select('id, name, display_name, description, color, icon, is_active')
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

  const getColors = (color: string) => {
    return colorMap[color] ?? { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/20' };
  };

  return (
    <section id="subjects" className="py-20 bg-background">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
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
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {subjects.map((subject) => {
              const colors = getColors(subject.color);
              const IconComponent = iconMap[subject.icon] ?? BookOpen;
              return (
                <div
                  key={subject.id}
                  className={`group bg-card border ${colors.border} rounded-2xl p-6 hover:shadow-card-hover transition-all duration-300 cursor-pointer`}
                >
                  <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <IconComponent size={22} className={colors.text} />
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-2">{subject.display_name}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {subject.description ?? `Comprehensive ${subject.display_name} preparation for CEE.`}
                  </p>
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
