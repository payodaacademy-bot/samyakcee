import React from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, Atom, FlaskRound, Brain } from 'lucide-react';

const subjects = [
  {
    key: 'subj-bio',
    name: 'Biology',
    icon: BookOpen,
    color: 'text-bio',
    bg: 'bg-bio-light',
    border: 'border-bio/20',
    chapters: 28,
    mcqs: 4800,
    notes: 340,
    topics: ['Cell Biology', 'Genetics', 'Human Physiology', 'Ecology', 'Evolution', 'Botany'],
    description: 'Most weightage in CEE — master cell biology, genetics, physiology, and ecology.',
    weight: '40%',
    weightColor: 'text-bio',
  },
  {
    key: 'subj-chem',
    name: 'Chemistry',
    icon: FlaskRound,
    color: 'text-chem',
    bg: 'bg-chem-light',
    border: 'border-chem/20',
    chapters: 22,
    mcqs: 3600,
    notes: 280,
    topics: ['Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry', 'Coordination Compounds'],
    description: 'Second highest weightage — cover reactions, equilibrium, and organic mechanisms.',
    weight: '35%',
    weightColor: 'text-chem',
  },
  {
    key: 'subj-physics',
    name: 'Physics',
    icon: Atom,
    color: 'text-physics',
    bg: 'bg-physics-light',
    border: 'border-physics/20',
    chapters: 18,
    mcqs: 2800,
    notes: 220,
    topics: ['Mechanics', 'Thermodynamics', 'Optics', 'Electricity', 'Modern Physics'],
    description: 'Formula-heavy — build strong conceptual base with our visual notes and problem sets.',
    weight: '20%',
    weightColor: 'text-physics',
  },
  {
    key: 'subj-ma',
    name: 'Mental Agility',
    icon: Brain,
    color: 'text-ma',
    bg: 'bg-ma-light',
    border: 'border-ma/20',
    chapters: 12,
    mcqs: 1800,
    notes: 160,
    topics: ['Logical Reasoning', 'Verbal Ability', 'Numerical Ability', 'Pattern Recognition'],
    description: 'Speed and accuracy matter — daily timed practice to sharpen your mental agility.',
    weight: '5%',
    weightColor: 'text-ma',
  },
];

export default function SubjectsSection() {
  return (
    <section id="subjects" className="py-16 bg-background">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="section-label mb-2">Subjects</p>
            <h2 className="text-hero-md text-foreground">Complete CEE Syllabus</h2>
            <p className="text-muted-foreground mt-2 max-w-lg">
              Chapter-wise notes, videos, and MCQs for all four CEE subjects
            </p>
          </div>
          <Link
            href="/subjects"
            className="btn-secondary text-sm whitespace-nowrap"
          >
            View All Chapters <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-4 gap-5">
          {subjects?.map((subj) => (
            <div
              key={subj?.key}
              className={`card-base card-hover border ${subj?.border} flex flex-col gap-4`}
            >
              <div className="flex items-start justify-between">
                <div className={`w-11 h-11 rounded-xl ${subj?.bg} flex items-center justify-center`}>
                  <subj.icon size={22} className={subj?.color} />
                </div>
                <span className={`text-sm font-bold ${subj?.weightColor} bg-white/50 dark:bg-card/50 px-2 py-0.5 rounded-full border border-current/20`}>
                  CEE {subj?.weight}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-lg text-foreground">{subj?.name}</h3>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{subj?.description}</p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { val: subj?.chapters, lbl: 'Chapters' },
                  { val: `${(subj?.mcqs / 1000)?.toFixed(1)}k`, lbl: 'MCQs' },
                  { val: subj?.notes, lbl: 'Notes' },
                ]?.map((m, i) => (
                  <div key={`${subj?.key}-meta-${i}`} className="bg-muted/60 rounded-lg p-2 text-center">
                    <p className={`font-bold text-sm tabular-nums ${subj?.color}`}>{m?.val}</p>
                    <p className="text-xs text-muted-foreground">{m?.lbl}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-1">
                {subj?.topics?.slice(0, 3)?.map((t) => (
                  <span key={`${subj?.key}-topic-${t}`} className={`text-xs px-2 py-0.5 rounded-full ${subj?.bg} ${subj?.color} font-medium`}>
                    {t}
                  </span>
                ))}
                {subj?.topics?.length > 3 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    +{subj?.topics?.length - 3} more
                  </span>
                )}
              </div>

              <Link
                href="/subjects"
                className={`mt-auto flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold ${subj?.bg} ${subj?.color} hover:opacity-80 transition-opacity`}
              >
                Start Learning <ArrowRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}