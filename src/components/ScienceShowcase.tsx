'use client';

import React from 'react';
import { Camera, Layers, Box, ChevronRight } from 'lucide-react';

export const ScienceShowcase: React.FC = () => {
  const steps = [
    {
      code: 'Step 01',
      title: 'Cartographie Biométrique',
      concept: 'Analyse algorithmique de plus de 70 points d\'ancrage sur l\'arcade sourcilière. Une précision chirurgicale au millimètre près.',
      icon: Camera,
    },
    {
      code: 'Step 02',
      title: 'Modélisation Paramétrique',
      concept: 'Transformation instantanée de vos mesures en un maillage 3D sur-mesure. Aucune approximation, une fidélité 1:1.',
      icon: Layers,
    },
    {
      code: 'Step 03',
      title: 'Impression Polymère Médical',
      concept: 'Fabrication haute précision en silicone biocompatible, hypoallergénique, à mémoire de forme et lavable à l\'infini.',
      icon: Box,
    },
  ];

  return (
    <section id="science" className="py-20 bg-obsidian border-t border-obsidian-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center space-y-3 mb-16">
          <span className="text-xs font-serif italic tracking-widest text-roseGold uppercase px-3.5 py-1 rounded-full bg-obsidian-card border border-roseGold/30 shadow-rose-glow">
            La Science du Sur-Mesure
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-wider uppercase">
            ARCHITECTURE DU PROCESSUS
          </h2>
          <p className="text-sm text-gray-300 font-serif italic max-w-xl mx-auto">
            La synergie absolue entre l'intelligence artificielle et l'ingénierie biomédicale.
          </p>
        </div>

        {/* 3 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="p-8 rounded-3xl bg-obsidian-card border border-obsidian-border shadow-cyber-luxury space-y-5 flex flex-col justify-between hover:border-roseGold/40 transition-all"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-obsidian border border-obsidian-border flex items-center justify-center text-roseGold shadow-sm">
                      <Icon className="w-7 h-7 text-roseGold" />
                    </div>
                    <span className="font-mono text-xs font-bold text-roseGold bg-roseGold/10 px-3 py-1 rounded-full border border-roseGold/20">
                      {step.code}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-lg text-white">
                    {step.title}
                  </h3>

                  <p className="text-xs text-gray-300 font-sans leading-relaxed">
                    {step.concept}
                  </p>
                </div>

                <div className="pt-4 border-t border-obsidian-border text-[11px] font-serif italic text-roseGold flex items-center gap-1">
                  <span>Précision Chirurgicale 1:1</span>
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
