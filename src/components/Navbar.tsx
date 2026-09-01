'use client';

import React from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';

interface NavbarProps {
  currentStep: number;
  totalSteps: number;
  onNavigateStep: (step: number) => void;
  onToggleAdmin?: () => void;
  isAdminOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentStep,
  onNavigateStep,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-pearl/90 backdrop-blur-md border-b border-pearl-border transition-all">
      
      {/* Top Banner */}
      <div className="bg-roseGold-banner text-white py-2 text-center shadow-sm">
        <span className="font-serif tracking-[0.25em] text-xs uppercase font-semibold">
          artistiQ • HAUTE BEAUTÉ SUR-MESURE
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <div 
          onClick={() => onNavigateStep(0)}
          className="cursor-pointer group flex items-center gap-2 select-none"
        >
          <Sparkles className="w-4 h-4 text-roseGold group-hover:rotate-12 transition-transform" />
          <span className="font-serif text-xl tracking-wider text-charcoal font-bold">
            artistiQ
          </span>
          <span className="text-[10px] uppercase tracking-widest text-charcoal-muted border-l border-pearl-border pl-2 font-sans">
            Haute Beauté
          </span>
        </div>

        {/* Pills */}
        <nav className="hidden md:flex items-center gap-1 bg-pearl-dark/80 p-1.5 rounded-full border border-pearl-border">
          {[
            { step: 0, label: 'Accueil' },
            { step: 1, label: 'Coordonnées' },
            { step: 2, label: 'Analyse' },
            { step: 3, label: 'Style Look' },
            { step: 4, label: 'Mon Tampon' },
          ].map((item) => {
            const isActive = currentStep === item.step;
            const isCompleted = currentStep > item.step;

            return (
              <button
                key={item.step}
                onClick={() => onNavigateStep(item.step)}
                className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all ${
                  isActive
                    ? 'bg-charcoal-button text-white shadow-button-shadow font-semibold'
                    : isCompleted
                    ? 'text-roseGold hover:text-charcoal'
                    : 'text-charcoal-muted hover:text-charcoal'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-roseGold" />}
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Tagline Badge */}
        <div className="text-xs font-serif italic text-charcoal-muted">
          Replicated Brow Technology
        </div>

      </div>
    </header>
  );
};
