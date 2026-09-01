'use client';

import React from 'react';
import { Logo } from './Logo';
import { Camera } from 'lucide-react';

interface NavbarProps {
  onNavigate?: (sectionId: string) => void;
  onStartScan: () => void;
  currentStep?: number;
  totalSteps?: number;
  onNavigateStep?: (step: number) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNavigate,
  onStartScan,
  onNavigateStep,
}) => {
  const handleNav = (target: string) => {
    if (onNavigate) onNavigate(target);
    else if (onNavigateStep) onNavigateStep(0);
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-obsidian/80 backdrop-blur-xl border-b border-obsidian-border transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Left: Logo */}
        <div 
          onClick={() => handleNav('hero')}
          className="cursor-pointer group flex items-center select-none"
        >
          <Logo showSubtitle={false} className="scale-90 origin-left" />
        </div>

        {/* Center: Quick Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-serif tracking-widest uppercase text-gray-300 font-semibold">
          <button onClick={() => handleNav('hero')} className="hover:text-roseGold transition-colors">
            Accueil
          </button>
          <button onClick={() => handleNav('technology')} className="hover:text-roseGold transition-colors">
            Technologie
          </button>
          <button onClick={() => handleNav('experience')} className="hover:text-roseGold transition-colors">
            Expérience
          </button>
        </nav>

        {/* Right: Dynamic Action Button */}
        <button
          onClick={onStartScan}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-roseGold-dark via-roseGold to-roseGold-metallic text-obsidian font-serif text-xs tracking-widest uppercase font-bold shadow-rose-glow hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
        >
          <Camera className="w-3.5 h-3.5 text-obsidian" />
          <span>Scanner Mon Visage</span>
        </button>

      </div>
    </header>
  );
};
