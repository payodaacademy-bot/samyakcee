'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { X, Wifi } from 'lucide-react';

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <div className="bg-primary text-primary-foreground relative z-50">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 h-10 flex items-center justify-center gap-3">
        <span className="flex items-center gap-1.5 text-xs sm:text-sm font-medium">
          <Wifi size={14} className="animate-pulse shrink-0" />
          <span className="hidden sm:inline">Live Class:</span>
          <span>Cell Division & Mitosis — Today 6:00 PM</span>
          <Link
            href="/live-classes"
            className="ml-2 bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-2.5 py-0.5 rounded-full transition-colors whitespace-nowrap"
          >
            Join Free →
          </Link>
        </span>
        <button
          onClick={() => setVisible(false)}
          className="absolute right-3 p-1 rounded hover:bg-white/20 transition-colors"
          aria-label="Dismiss"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}