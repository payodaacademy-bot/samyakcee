import React from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import { Mail, Phone, MapPin } from 'lucide-react';

// Social icons as inline SVGs since lucide-react v1.x renamed these
const FacebookIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
const InstagramIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);
const YoutubeIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" /><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" />
  </svg>
);

const footerLinks = [
  {
    key: 'col-learn',
    title: 'Learn',
    links: [
      { key: 'fl-notes', label: 'Chapter Notes', href: '#notes' },
      { key: 'fl-videos', label: 'Video Lectures', href: '#videos' },
      { key: 'fl-live', label: 'Live Classes', href: '#live' },
      { key: 'fl-ai', label: 'AI Tutor', href: '#ai' },
    ],
  },
  {
    key: 'col-practice',
    title: 'Practice',
    links: [
      { key: 'fl-mcq', label: 'MCQ Practice', href: '#practice' },
      { key: 'fl-mock', label: 'Mock Tests', href: '#mock' },
      { key: 'fl-battle', label: 'Battle Arena', href: '#battle' },
      { key: 'fl-leaderboard', label: 'Leaderboard', href: '#leaderboard' },
    ],
  },
  {
    key: 'col-company',
    title: 'Company',
    links: [
      { key: 'fl-about', label: 'About Us', href: '#about' },
      { key: 'fl-blog', label: 'Blog', href: '#blog' },
      { key: 'fl-careers', label: 'Careers', href: '#careers' },
      { key: 'fl-contact', label: 'Contact', href: '#contact' },
    ],
  },
  {
    key: 'col-legal',
    title: 'Legal',
    links: [
      { key: 'fl-terms', label: 'Terms of Service', href: '#terms' },
      { key: 'fl-privacy', label: 'Privacy Policy', href: '#privacy' },
      { key: 'fl-refund', label: 'Refund Policy', href: '#refund' },
      { key: 'fl-support', label: 'Support', href: '#support' },
    ],
  },
];

export default function HomepageFooter() {
  return (
    <footer className="bg-foreground text-white pt-14 pb-8">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-8 mb-10">
          {/* Brand */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <AppLogo size={36} />
              <div className="flex flex-col leading-none">
                <span className="font-extrabold text-base text-white tracking-tight">Samyak</span>
                <span className="text-xs font-medium text-primary">CEE Mastery</span>
              </div>
            </div>
            <p className="text-sm text-white/60 leading-relaxed max-w-xs">
              Nepal&apos;s most comprehensive CEE medical entrance preparation platform. Trusted by 40,000+ aspirants.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-white/60">
                <Mail size={14} className="shrink-0" />
                support@samyakcee.com.np
              </div>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <Phone size={14} className="shrink-0" />
                +977-1-4XXXXXX
              </div>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <MapPin size={14} className="shrink-0" />
                Kathmandu, Nepal
              </div>
            </div>
            <div className="flex items-center gap-3">
              {[
                { key: 'social-fb', icon: FacebookIcon, href: '#' },
                { key: 'social-ig', icon: InstagramIcon, href: '#' },
                { key: 'social-yt', icon: YoutubeIcon, href: '#' },
              ]?.map((s) => (
                <a
                  key={s?.key}
                  href={s?.href}
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  aria-label={s?.key}
                >
                  <s.icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {footerLinks?.map((col) => (
            <div key={col?.key}>
              <p className="font-semibold text-sm mb-4 text-white">{col?.title}</p>
              <ul className="space-y-2">
                {col?.links?.map((link) => (
                  <li key={link?.key}>
                    <Link href={link?.href} className="text-sm text-white/60 hover:text-white transition-colors">
                      {link?.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/40">
            © 2026 Samyak Online Education Pvt. Ltd. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/40">Payments powered by</span>
            {['eSewa', 'Khalti', 'Fonepay']?.map((p) => (
              <span key={`pay-${p}`} className="text-xs font-bold bg-white/10 px-2 py-0.5 rounded text-white/70">
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}