'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

interface HeaderProps {
  onNavigate: (sectionId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-purple-100/60 via-blue-50/60 to-pink-100/60 backdrop-blur-xl border-b border-white/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Name */}
        <div 
          onClick={() => onNavigate('hero')}
          className="cursor-pointer flex items-center gap-2 select-none"
        >
          <Sparkles className="w-4 h-4 text-roseGold" />
          <span className="font-serif text-2xl tracking-[0.2em] uppercase font-bold text-charcoal">
            artistiQ
          </span>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-serif tracking-widest uppercase text-charcoal font-semibold">
          <button onClick={() => onNavigate('hero')} className="hover:text-roseGold transition-colors">
            Accueil
          </button>
          <button onClick={() => onNavigate('processus')} className="hover:text-roseGold transition-colors">
            Notre Processus
          </button>
          <button onClick={() => onNavigate('produits')} className="hover:text-roseGold transition-colors">
            Produits
          </button>
          <button onClick={() => onNavigate('commander')} className="hover:text-roseGold transition-colors">
            Commander
          </button>
        </nav>

        {/* CTA */}
        <button
          onClick={() => onNavigate('commander')}
          className="px-5 py-2 rounded-lg bg-charcoal-button hover:bg-charcoal-buttonHover text-white font-serif text-xs tracking-widest uppercase font-semibold shadow-button-shadow transition-all"
        >
          Commander
        </button>

      </div>
    </header>
  );
};
