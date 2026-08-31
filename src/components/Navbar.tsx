'use client';

import React from 'react';
import { Sparkles, ShieldCheck, Cpu, UserCheck } from 'lucide-react';

interface NavbarProps {
  currentStep: number;
  totalSteps: number;
  onNavigateStep: (step: number) => void;
  onToggleAdmin: () => void;
  isAdminOpen: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentStep,
  onNavigateStep,
  onToggleAdmin,
  isAdminOpen,
}) => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-obsidian/80 border-b border-obsidian-border transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <div 
          onClick={() => onNavigateStep(0)}
          className="cursor-pointer group flex items-center gap-3 select-none"
        >
          <div className="relative w-11 h-11 rounded-xl bg-gradient-to-tr from-gold-dark via-gold to-gold-light p-[1.5px] shadow-gold-glow group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-obsidian rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-gold group-hover:rotate-12 transition-transform" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-gold-light to-gold bg-clip-text text-transparent">
                artistiQ
              </span>
              <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-gold/10 text-gold border border-gold/20 font-mono">
                IA Biométrique
              </span>
            </div>
            <p className="text-[11px] text-gray-400 font-light tracking-widest uppercase">
              Haute Technologie Sur-Mesure
            </p>
          </div>
        </div>

        {/* Navigation / Progress Indicator */}
        <nav className="hidden md:flex items-center gap-2 bg-obsidian-card border border-obsidian-border rounded-full p-1.5 px-3">
          {[
            { step: 0, label: 'Accueil' },
            { step: 1, label: 'Coordonnées' },
            { step: 2, label: 'Scan IA 3D' },
            { step: 3, label: 'Stylisme 3D' },
            { step: 4, label: 'Aperçu Moule' },
          ].map((item) => {
            const isActive = currentStep === item.step;
            const isCompleted = currentStep > item.step;

            return (
              <button
                key={item.step}
                onClick={() => onNavigateStep(item.step)}
                className={`relative px-4 py-2 text-xs font-medium rounded-full transition-all duration-300 ${
                  isActive
                    ? 'text-obsidian bg-gradient-to-r from-gold-light via-gold to-gold-dark font-semibold shadow-gold-glow'
                    : isCompleted
                    ? 'text-gold hover:text-white'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {isCompleted && <ShieldCheck className="w-3.5 h-3.5 text-gold" />}
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Admin Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleAdmin}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-300 border ${
              isAdminOpen
                ? 'bg-biometric-cyan/10 text-biometric-cyan border-biometric-cyan/30 shadow-cyan-glow'
                : 'bg-obsidian-card text-gray-300 border-obsidian-border hover:border-gold/40 hover:text-gold'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span className="hidden sm:inline">Espace Atelier & Production</span>
            <span className="sm:hidden">Atelier</span>
          </button>
        </div>
      </div>
    </header>
  );
};
