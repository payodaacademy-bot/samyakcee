'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQ {
  id: number;
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    id: 1,
    question: 'What is Samyak CEE Mastery?',
    answer: "Samyak CEE Mastery is Nepal's most comprehensive online preparation platform for the CEE (Common Entrance Examination) medical entrance exam. We provide premium notes, video lectures, MCQ practice, live classes, and AI-powered study tools to help you crack CEE.",
  },
  {
    id: 2,
    question: 'How many MCQs are available on the platform?',
    answer: 'We have over 14,000+ carefully curated MCQs covering all CEE subjects — Biology, Chemistry, Physics, and Mathematics. Each question comes with detailed explanations and is categorized by difficulty level.',
  },
  {
    id: 3,
    question: 'Is there a free plan available?',
    answer: 'Yes! Our free plan gives you access to a limited set of MCQs, basic notes, and the community features. Upgrade to our Pro or Elite plan to unlock unlimited MCQs, all video lectures, live classes, and AI-powered tools.',
  },
  {
    id: 4,
    question: 'What is the Battle Arena feature?',
    answer: 'Battle Arena is our unique real-time competitive feature where you can challenge other students to MCQ battles. It makes studying fun and competitive, helping you stay motivated while testing your knowledge against peers.',
  },
  {
    id: 5,
    question: 'How do activation codes work?',
    answer: 'Activation codes are special codes distributed by Samyak CEE coaching centers and partners. Enter your code on the platform to unlock premium features at a discounted rate or as part of your coaching package.',
  },
  {
    id: 6,
    question: 'Are the video lectures downloadable for offline use?',
    answer: 'Currently, video lectures are available for online streaming only. We are working on offline download support for our mobile app. You can download PDF notes and study materials for offline use.',
  },
  {
    id: 7,
    question: 'How often is new content added?',
    answer: 'Our content team adds new MCQs, notes, and video lectures every week. Live classes are scheduled regularly with expert teachers. You will receive notifications when new content relevant to your subjects is published.',
  },
  {
    id: 8,
    question: 'Can I access the platform on mobile?',
    answer: 'Yes! Samyak CEE Mastery is fully responsive and works on all devices. We also have a Progressive Web App (PWA) that you can install on your phone for a native app-like experience without downloading from an app store.',
  },
];

const FAQSection = () => {
  const [openId, setOpenId] = useState<number | null>(1);

  const toggle = (id: number) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="py-20 bg-background">
      <div className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full mb-4 tracking-wider uppercase">
            FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-base text-muted-foreground max-w-xl mx-auto">
            Everything you need to know about Samyak CEE Mastery. Can&apos;t find your answer?{' '}
            <a href="mailto:support@samyakcee.com.np" className="text-primary hover:underline">
              Contact us
            </a>
            .
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {faqs.map((faq) => (
            <div
              key={faq.id}
              className={`bg-card border rounded-2xl overflow-hidden transition-all duration-200 ${openId === faq.id ? 'border-primary/30 shadow-card' : 'border-border'}`}
            >
              <button
                onClick={() => toggle(faq.id)}
                className="w-full flex items-center justify-between px-6 py-4 text-left"
              >
                <span className="text-sm font-semibold text-foreground pr-4">{faq.question}</span>
                <ChevronDown
                  size={18}
                  className={`shrink-0 text-muted-foreground transition-transform duration-200 ${openId === faq.id ? 'rotate-180 text-primary' : ''}`}
                />
              </button>
              {openId === faq.id && (
                <div className="px-6 pb-5">
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
