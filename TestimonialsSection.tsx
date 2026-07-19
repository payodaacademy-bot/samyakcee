'use client';

import React, { useState } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

interface Testimonial {
  id: number;
  name: string;
  college: string;
  rank: string;
  year: string;
  text: string;
  rating: number;
  initials: string;
  color: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Priya Sharma',
    college: 'BPKIHS, Dharan',
    rank: 'CEE Rank #12',
    year: '2025',
    text: 'Samyak CEE Mastery completely transformed my preparation. The MCQ bank is incredibly comprehensive and the battle arena kept me motivated throughout. I cracked CEE with rank 12!',
    rating: 5,
    initials: 'PS',
    color: 'bg-bio-light text-bio',
  },
  {
    id: 2,
    name: 'Aarav Thapa',
    college: 'IOM, Maharajgunj',
    rank: 'CEE Rank #34',
    year: '2025',
    text: 'The video lectures are top-notch and the live classes with expert teachers made complex topics easy. The analytics dashboard helped me identify my weak areas and improve systematically.',
    rating: 5,
    initials: 'AT',
    color: 'bg-physics-light text-physics',
  },
  {
    id: 3,
    name: 'Sita Rai',
    college: 'KIST Medical College',
    rank: 'CEE Rank #67',
    year: '2025',
    text: 'I was struggling with Chemistry but the structured notes and chapter-wise MCQs on Samyak helped me master it. The platform is intuitive and the content quality is unmatched in Nepal.',
    rating: 5,
    initials: 'SR',
    color: 'bg-chem-light text-chem',
  },
  {
    id: 4,
    name: 'Rohan Gurung',
    college: 'Manipal College of Medical Sciences',
    rank: 'CEE Rank #89',
    year: '2025',
    text: 'The exam simulation feature is exactly like the real CEE. Practicing under timed conditions with the same interface gave me the confidence I needed on exam day. Highly recommended!',
    rating: 5,
    initials: 'RG',
    color: 'bg-ma-light text-ma',
  },
  {
    id: 5,
    name: 'Anisha Poudel',
    college: 'Nobel Medical College',
    rank: 'CEE Rank #103',
    year: '2025',
    text: 'The activation code system made it affordable for me. The study plan AI feature created a personalized schedule that fit my routine perfectly. Worth every paisa spent!',
    rating: 5,
    initials: 'AP',
    color: 'bg-primary/10 text-primary',
  },
];

const TestimonialsSection = () => {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => (c === 0 ? testimonials.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === testimonials.length - 1 ? 0 : c + 1));

  const visible = [
    testimonials[(current) % testimonials.length],
    testimonials[(current + 1) % testimonials.length],
    testimonials[(current + 2) % testimonials.length],
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full mb-4 tracking-wider uppercase">
            Success Stories
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-4">
            Students Who Cracked CEE
          </h2>
          <p className="text-base text-muted-foreground max-w-xl mx-auto">
            Join thousands of students who achieved their dream of becoming doctors with Samyak CEE Mastery.
          </p>
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {visible.map((t, idx) => (
            <div
              key={`${t.id}-${idx}`}
              className={`bg-card border border-border rounded-2xl p-6 transition-all duration-300 ${idx === 1 ? 'shadow-card-hover scale-105' : 'opacity-80'}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center font-bold text-sm`}>
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.college}</p>
                  </div>
                </div>
                <Quote size={18} className="text-primary/30 shrink-0" />
              </div>

              <div className="flex items-center gap-0.5 mb-3">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} size={13} className="text-warning fill-warning" />
                ))}
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className="text-xs font-bold text-primary">{t.rank}</span>
                <span className="text-xs text-muted-foreground">CEE {t.year}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={prev}
            className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="flex gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-primary w-6' : 'bg-border'}`}
              />
            ))}
          </div>
          <button
            onClick={next}
            className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
