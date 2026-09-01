'use client';

import React from 'react';
import { Camera, Layers, Box, ChevronRight } from 'lucide-react';

export const TechnologyShowcase: React.FC = () => {
  const steps = [
    {
      code: 'Step 01',
      title: 'Cartographie Biométrique',
      text: 'Notre algorithme de vision par ordinateur identifie plus de 70 points de structure uniques sur votre arcade sourcilière à partir d\'une simple photo.',
      icon: Camera,
    },
    {
      code: 'Step 02',
      title: 'Modélisation Micro-Précise',
      text: 'Conversion instantanée des contours en un maillage 3D paramétrique. Aucune approximation, une fidélité 1:1 avec votre anatomie.',
      icon: Layers,
    },
    {
      code: 'Step 03',
      title: 'Impression Silicone Médical',
      text: 'Fabrication sur-mesure de votre applicateur ergonomique à partir de matériaux hypoallergéniques, flexibles et lavables.',
      icon: Box,
    },
  ];

  return (
    <section className="py-20 bg-pearl border-t border-pearl-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center space-y-3 mb-16">
          <span className="text-xs font-serif italic tracking-widest text-roseGold uppercase px-3.5 py-1 rounded-full bg-roseGold-light border border-roseGold/20">
            Technologie & Algorithme
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-charcoal tracking-wider uppercase">
            LA SCIENCE ARTISTIQ
          </h2>
          <p className="text-sm text-charcoal-muted font-serif italic max-w-xl mx-auto">
            Comment nous transformons la géométrie de votre regard en un outil d'application parfait.
          </p>
        </div>

        {/* 3 Interactive Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="p-8 rounded-3xl bg-pearl-card border border-pearl-border shadow-soft-luxury space-y-5 flex flex-col justify-between hover:border-roseGold/40 transition-all"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-pearl border border-pearl-border flex items-center justify-center text-roseGold shadow-sm">
                      <Icon className="w-7 h-7 text-roseGold" />
                    </div>
                    <span className="font-mono text-xs font-bold text-roseGold bg-roseGold-light px-3 py-1 rounded-full border border-roseGold/20">
                      {step.code}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-lg text-charcoal">
                    {step.title}
                  </h3>

                  <p className="text-xs text-charcoal-muted font-sans leading-relaxed">
                    {step.text}
                  </p>
                </div>

                <div className="pt-4 border-t border-pearl-border text-[11px] font-serif italic text-roseGold flex items-center gap-1">
                  <span>Précision Anatomique 1:1</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-auto" />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
