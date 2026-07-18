'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import { Menu, X, Sun, Moon } from 'lucide-react';

interface PublicNavProps {
  isDark?: boolean;
  onToggleDark?: () => void;
}

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Subjects', href: '#subjects' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Leaderboard', href: '/leaderboard' },
];

const PublicNav = ({ isDark, onToggleDark }: PublicNavProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <AppLogo size={36} />
          <div className="flex flex-col leading-none">
            <span className="font-extrabold text-sm text-foreground tracking-tight">Samyak</span>
            <span className="text-xs font-medium text-primary">CEE Mastery</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {onToggleDark && (
            <button
              onClick={onToggleDark}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          )}
          <Link
            href="/sign-up-login-screen"
            className="hidden sm:inline-flex btn-primary text-sm"
          >
            Get Started
          </Link>
          <button
            className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="block px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/sign-up-login-screen"
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-primary hover:bg-primary/10 transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            Get Started →
          </Link>
        </div>
      )}
    </nav>
  );
};

export default PublicNav;
