'use client';

import React from 'react';
import { Logo } from './Logo';
import { Sparkles } from 'lucide-react';

interface NavbarProps {
  onNavigate: (sectionId: string) => void;
  onStartScan: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNavigate,
  onStartScan,
}) => {
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-obsidian/85 backdrop-blur-2xl border-b border-obsidian-border transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Left: Brand Mark */}
        <div 
          onClick={() => onNavigate('hero')}
          className="cursor-pointer group flex items-center select-none"
        >
          <Logo showSubtitle={false} className="scale-90 origin-left" />
        </div>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-serif tracking-widest uppercase text-gray-300 font-semibold">
          <button onClick={() => onNavigate('experience')} className="hover:text-roseGold transition-colors flex items-center gap-1">
            <span className="text-roseGold font-mono text-[10px]">.01</span> L'Expérience
          </button>
          <button onClick={() => onNavigate('science')} className="hover:text-roseGold transition-colors flex items-center gap-1">
            <span className="text-roseGold font-mono text-[10px]">.02</span> La Science
          </button>
          <button onClick={() => onNavigate('studio')} className="hover:text-roseGold transition-colors flex items-center gap-1">
            <span className="text-roseGold font-mono text-[10px]">.03</span> Le Studio
          </button>
        </nav>

        {/* Right: Action Button */}
        <button
          onClick={onStartScan}
          className="px-6 py-2.5 rounded-xl bg-obsidian border-2 border-roseGold/60 text-roseGold font-serif text-xs tracking-widest uppercase font-bold shadow-rose-glow hover:bg-roseGold/10 transition-all flex items-center gap-2 relative overflow-hidden group"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-roseGold/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          <Sparkles className="w-3.5 h-3.5 text-roseGold animate-pulse" />
          <span>[ ANALYSER MON REGARD ]</span>
        </button>

      </div>
    </header>
  );
};
