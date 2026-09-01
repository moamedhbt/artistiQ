'use client';

import React from 'react';
import { Logo } from './Logo';
import { Camera } from 'lucide-react';

interface NavbarProps {
  currentStep: number;
  totalSteps: number;
  onNavigateStep: (step: number) => void;
  onStartScan: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNavigateStep,
  onStartScan,
}) => {
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-pearl/80 backdrop-blur-xl border-b border-pearl-border transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Left: Logo */}
        <div 
          onClick={() => onNavigateStep(0)}
          className="cursor-pointer group flex items-center select-none"
        >
          <Logo showSubtitle={false} className="scale-90 origin-left" />
        </div>

        {/* Center: Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-serif tracking-widest uppercase text-charcoal font-semibold">
          <button onClick={() => onNavigateStep(0)} className="hover:text-roseGold transition-colors">
            Accueil
          </button>
          <button onClick={() => onNavigateStep(0)} className="hover:text-roseGold transition-colors">
            Technologie
          </button>
          <button onClick={() => onNavigateStep(0)} className="hover:text-roseGold transition-colors">
            Expérience
          </button>
        </nav>

        {/* Right: Dynamic Scanner Button */}
        <button
          onClick={onStartScan}
          className="px-6 py-2.5 rounded-xl bg-charcoal-button hover:bg-charcoal-buttonHover text-white font-serif text-xs tracking-widest uppercase font-bold shadow-button-shadow border border-roseGold/30 transition-all flex items-center gap-2"
        >
          <Camera className="w-3.5 h-3.5 text-roseGold" />
          <span>Scanner Mon Visage</span>
        </button>

      </div>
    </header>
  );
};
