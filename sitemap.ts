'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, XCircle, ChevronRight, Zap, Clock, Target } from 'lucide-react';

const sampleMCQ = {
  id: 'mcq-preview-1',
  subject: 'Biology',
  chapter: 'Cell Biology',
  difficulty: 'Medium',
  question: 'Which of the following correctly describes the role of the Golgi apparatus in protein secretion?',
  options: [
    { id: 'opt-a', label: 'A', text: 'Synthesizes proteins directly from amino acids' },
    { id: 'opt-b', label: 'B', text: 'Modifies, sorts, and packages proteins for secretion or delivery to other organelles' },
    { id: 'opt-c', label: 'C', text: 'Provides energy for protein synthesis via ATP production' },
    { id: 'opt-d', label: 'D', text: 'Degrades misfolded proteins using lysosomal enzymes' },
  ],
  correct: 'opt-b',
  explanation: 'The Golgi apparatus (Golgi complex) functions as the cell\'s post office. Proteins synthesized in the rough ER are transported to the Golgi, where they undergo glycosylation, phosphorylation, and sulfation. The Golgi then sorts and packages these modified proteins into vesicles for secretion or delivery to lysosomes, the plasma membrane, or other destinations.',
  source: 'CEE 2023, Q.14',
};

export default function MCQPreviewSection() {
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const handleOption = (id: string) => {
    if (revealed) return;
    setSelected(id);
    setRevealed(true);
  };

  const isCorrect = selected === sampleMCQ.correct;

  return (
    <section id="practice" className="py-16 bg-muted/30">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left — copy */}
          <div className="space-y-6">
            <p className="section-label">MCQ Practice Engine</p>
            <h2 className="text-hero-md text-foreground">15,000+ Questions with Detailed Explanations</h2>
            <p className="text-muted-foreground leading-relaxed">
              Every MCQ is written, reviewed, and explained by experienced CEE teachers. Practice by chapter, difficulty, or topic — or let our adaptive engine choose for you.
            </p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { key: 'feat-adaptive', icon: Target, label: 'Adaptive Practice', color: 'text-primary', bg: 'bg-secondary' },
                { key: 'feat-timed', icon: Clock, label: 'Timed Sets', color: 'text-bio', bg: 'bg-bio-light' },
                { key: 'feat-prev', icon: Zap, label: 'Previous Year', color: 'text-ma', bg: 'bg-ma-light' },
              ].map((f) => (
                <div key={f.key} className="card-base text-center py-4">
                  <div className={`w-9 h-9 rounded-lg ${f.bg} flex items-center justify-center mx-auto mb-2`}>
                    <f.icon size={18} className={f.color} />
                  </div>
                  <p className="text-xs font-semibold text-foreground">{f.label}</p>
                </div>
              ))}
            </div>
            <Link href="/practice" className="btn-primary gap-2 inline-flex">
              Start Practicing Free
              <ChevronRight size={16} />
            </Link>
          </div>

          {/* Right — interactive MCQ widget */}
          <div className="card-base shadow-card max-w-lg w-full mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="subject-bio text-xs font-bold px-2 py-0.5 rounded-full border">{sampleMCQ.subject}</span>
                <span className="text-xs text-muted-foreground">{sampleMCQ.chapter}</span>
              </div>
              <span className="text-xs bg-ma-light text-ma font-medium px-2 py-0.5 rounded-full">{sampleMCQ.difficulty}</span>
            </div>

            <p className="text-sm font-semibold text-foreground leading-relaxed mb-4">
              {sampleMCQ.question}
            </p>

            <div className="space-y-2 mb-4">
              {sampleMCQ.options.map((opt) => {
                const isSelected = selected === opt.id;
                const isAnswer = opt.id === sampleMCQ.correct;
                let cls = 'border border-border bg-muted/40 hover:bg-muted cursor-pointer';
                if (revealed && isAnswer) cls = 'border-2 border-success bg-success-light cursor-default';
                else if (revealed && isSelected && !isAnswer) cls = 'border-2 border-error bg-error-light cursor-default';
                else if (isSelected && !revealed) cls = 'border-2 border-primary bg-secondary cursor-pointer';

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleOption(opt.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 ${cls}`}
                  >
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border ${
                      revealed && isAnswer ? 'bg-success text-white border-success' : revealed && isSelected && !isAnswer ?'bg-error text-white border-error': 'border-border text-muted-foreground'
                    }`}>
                      {opt.label}
                    </span>
                    <span className="text-sm text-foreground flex-1">{opt.text}</span>
                    {revealed && isAnswer && <CheckCircle2 size={16} className="text-success shrink-0" />}
                    {revealed && isSelected && !isAnswer && <XCircle size={16} className="text-error shrink-0" />}
                  </button>
                );
              })}
            </div>

            {revealed && (
              <div className={`rounded-xl p-3 ${isCorrect ? 'bg-success-light border border-success/20' : 'bg-error-light border border-error/20'}`}>
                <p className={`text-xs font-bold mb-1 ${isCorrect ? 'text-success' : 'text-error'}`}>
                  {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
                </p>
                <p className="text-xs text-foreground leading-relaxed">{sampleMCQ.explanation}</p>
                <p className="text-xs text-muted-foreground mt-1.5">Source: {sampleMCQ.source}</p>
              </div>
            )}

            {!revealed && (
              <p className="text-xs text-center text-muted-foreground">
                Select an option to see the answer and explanation
              </p>
            )}

            {revealed && (
              <button
                onClick={() => { setSelected(null); setRevealed(false); }}
                className="mt-3 w-full btn-secondary text-sm py-2"
              >
                Try Another Question
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}