import React from 'react';
import Link from 'next/link';
import AppLogo from './src/components/ui/AppLogo';
import { Mail, Phone, MapPin } from 'lucide-react';

const footerLinks = {
  Platform: [
    { label: 'Features', href: '#features' },
    { label: 'Subjects', href: '#subjects' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Leaderboard', href: '/leaderboard' },
    { label: 'Battle Arena', href: '/battle-arena' },
  ],
  Resources: [
    { label: 'MCQ Practice', href: '/practice' },
    { label: 'Mock Tests', href: '/mock-tests' },
    { label: 'Study Plan', href: '/study-plan' },
    { label: 'Live Classes', href: '/live-classes' },
    { label: 'AI Tutor', href: '/ai-tutor' },
  ],
  Company: [
    { label: 'About Us', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Careers', href: '/careers' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
};

const socialLinks = [
  { href: 'https://www.facebook.com/samyakcee', label: 'Facebook', letter: 'f' },
  { href: 'https://www.instagram.com/samyakcee', label: 'Instagram', letter: 'in' },
  { href: 'https://www.youtube.com/samyakcee', label: 'YouTube', letter: 'yt' },
];

const HomepageFooter = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <AppLogo size={40} />
              <div className="flex flex-col leading-none">
                <span className="font-extrabold text-base text-foreground tracking-tight">Samyak</span>
                <span className="text-xs font-medium text-primary">CEE Mastery</span>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-xs">
              Nepal&apos;s most comprehensive CEE medical entrance preparation platform. Trusted by 40,000+ aspirants.
            </p>

            {/* Contact */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail size={14} className="text-primary shrink-0" />
                <span>support@samyakcee.com.np</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone size={14} className="text-primary shrink-0" />
                <span>+977-01-4XXXXXX</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin size={14} className="text-primary shrink-0" />
                <span>Kathmandu, Nepal</span>
              </div>
            </div>

            {/* Social */}
            <div className="flex items-center gap-3">
              {socialLinks?.map(({ href, label, letter }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors text-xs font-bold"
                >
                  {letter}
                </a>
              ))}            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks)?.map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-bold text-foreground mb-4">{category}</h4>
              <ul className="space-y-2.5">
                {links?.map((link) => (
                  <li key={link?.label}>
                    <Link
                      href={link?.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link?.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date()?.getFullYear()} Samyak CEE Mastery. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default HomepageFooter;
