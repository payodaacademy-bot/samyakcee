import React from 'react';
import { Star, TrendingUp } from 'lucide-react';

const testimonials = [
  {
    key: 'test-1',
    name: 'Sushila Karki',
    college: 'KIST Medical College, Lalitpur',
    subject: 'MBBS 1st Year',
    initial: 'S',
    color: 'bg-bio/20 text-bio',
    rating: 5,
    percentile: 94,
    quote: 'The weak-topic detection feature literally told me exactly which chapters of Cell Biology I was weak in. I revised those 3 chapters and jumped from 68% to 91% accuracy in just two weeks.',
    beforeRank: 1842,
    afterRank: 147,
  },
  {
    key: 'test-2',
    name: 'Roshan Basnet',
    college: 'Tribhuvan University, Kathmandu',
    subject: 'MBBS 2nd Year',
    initial: 'R',
    color: 'bg-chem/20 text-chem',
    rating: 5,
    percentile: 89,
    quote: 'Battle Arena changed how I study. Competing with friends made me actually enjoy Chemistry. The server-side timer means no one can cheat — it\'s genuinely fair.',
    beforeRank: 2341,
    afterRank: 312,
  },
  {
    key: 'test-3',
    name: 'Manisha Tamang',
    college: 'Manipal College of Medical Sciences, Pokhara',
    subject: 'MBBS 1st Year',
    initial: 'M',
    color: 'bg-physics/20 text-physics',
    rating: 5,
    percentile: 97,
    quote: 'I cleared CEE in my first attempt with rank 89. The personalized study plan kept me on track every single day. The notes are incredibly detailed — better than any book I\'ve read.',
    beforeRank: null,
    afterRank: 89,
  },
  {
    key: 'test-4',
    name: 'Dipesh Rana',
    college: 'BP Koirala Institute of Health Sciences, Dharan',
    subject: 'MBBS 1st Year',
    initial: 'D',
    color: 'bg-ma/20 text-ma',
    rating: 5,
    percentile: 91,
    quote: 'The AI tutor explained Organic Chemistry reaction mechanisms so clearly that I finally understood what I was memorizing. 15,000 MCQs with explanations — nothing else comes close.',
    beforeRank: 3100,
    afterRank: 201,
  },
];

export default function TestimonialsSection() {
  return (
    <section id="success" className="py-16 bg-background">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="text-center mb-10">
          <p className="section-label mb-2">Student Success</p>
          <h2 className="text-hero-md text-foreground">Real Results from Real Students</h2>
          <p className="text-muted-foreground mt-2">
            These are actual CEE students who used Samyak CEE Mastery
          </p>
        </div>

        <div className="grid sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-4 gap-5">
          {testimonials?.map((t) => (
            <div key={t?.key} className="card-base card-hover flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${t?.color} flex items-center justify-center font-bold text-lg`}>
                    {t?.initial}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{t?.name}</p>
                    <p className="text-xs text-muted-foreground">{t?.subject}</p>
                  </div>
                </div>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: t?.rating })?.map((_, i) => (
                    <Star key={`star-${t?.key}-${i}`} size={12} className="text-ma fill-ma" />
                  ))}
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed flex-1 italic">
                &ldquo;{t?.quote}&rdquo;
              </p>

              <div className="flex items-center gap-2 bg-success-light rounded-xl px-3 py-2">
                <TrendingUp size={14} className="text-success shrink-0" />
                <div className="text-xs">
                  {t?.beforeRank ? (
                    <span className="text-foreground font-medium">
                      Rank <span className="text-error line-through">{t?.beforeRank?.toLocaleString()}</span>
                      {' → '}
                      <span className="text-success font-bold">{t?.afterRank}</span>
                    </span>
                  ) : (
                    <span className="text-success font-bold">First attempt — Rank {t?.afterRank}</span>
                  )}
                </div>
                <span className="ml-auto text-xs font-bold text-success">{t?.percentile}th %ile</span>
              </div>

              <p className="text-xs text-muted-foreground">{t?.college}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}