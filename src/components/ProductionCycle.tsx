'use client';

import React from 'react';
import { Cpu, Zap, Crosshair, Box, ChevronRight } from 'lucide-react';

export const ProductionCycle: React.FC = () => {
  const steps = [
    {
      code: '01',
      icon: Cpu,
      title: 'DISPENSER NOZZLE',
      subtitle: 'Injecteur de Précision',
      description: 'Injection micronique de la résine silicone cosmétique bio-adaptative.',
    },
    {
      code: '02',
      icon: Zap,
      title: 'UV-CURING TUNNEL',
      subtitle: 'Tunnel de Polymérisation UV',
      description: 'Stabilisation instantanée de la géométrie de votre arcade sous lumière UV.',
    },
    {
      code: '03',
      icon: Crosshair,
      title: 'LASER MARKER',
      subtitle: 'Gravure Laser Sur-Mesure',
      description: 'Gravure de votre identifiant biométrique individuel sur le boîtier.',
    },
    {
      code: '04',
      icon: Box,
      title: 'FINAL CUBE',
      subtitle: 'Tampon Cristal Fini',
      description: 'Votre applicateur en silicone souple haute définition prêt pour l\'emploi.',
    },
  ];

  return (
    <section id="processus" className="py-20 bg-pearl border-t border-pearl-border relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center space-y-3 mb-16">
          <span className="text-xs font-serif italic tracking-widest text-roseGold uppercase px-3.5 py-1 rounded-full bg-roseGold-light border border-roseGold/20">
            Technologie & Laboratoire
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-charcoal tracking-wider uppercase">
            LE CYCLE DE PRODUCTION
          </h2>
          <p className="text-sm text-charcoal-muted font-serif italic max-w-xl mx-auto">
            Découvrez le processus de confection automatisé haute précision de votre tampon sur-mesure.
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-pearl-card border border-pearl-border shadow-soft-luxury space-y-4 hover:border-roseGold/40 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-pearl border border-pearl-border flex items-center justify-center text-charcoal shadow-sm">
                      <Icon className="w-6 h-6 text-roseGold" />
                    </div>
                    <span className="font-mono text-xs font-bold text-roseGold bg-roseGold-light px-2.5 py-1 rounded-full border border-roseGold/20">
                      {step.code}
                    </span>
                  </div>

                  <div className="pt-2">
                    <p className="font-serif font-bold text-xs tracking-widest text-charcoal uppercase">
                      {step.title}
                    </p>
                    <p className="text-xs font-serif italic text-roseGold font-semibold">
                      {step.subtitle}
                    </p>
                  </div>

                  <p className="text-xs text-charcoal-muted font-sans leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-pearl-border text-[10px] font-mono text-charcoal-muted flex items-center gap-1">
                  <span>artistiQ Lab Process</span>
                  <ChevronRight className="w-3 h-3 text-roseGold ml-auto" />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
