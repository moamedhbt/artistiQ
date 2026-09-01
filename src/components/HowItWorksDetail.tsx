'use client';

import React from 'react';
import { Camera, Layers, Box, ChevronRight } from 'lucide-react';

interface HowItWorksDetailProps {
  onStartClick: () => void;
}

export const HowItWorksDetail: React.FC<HowItWorksDetailProps> = ({ onStartClick }) => {
  const steps = [
    {
      num: '1',
      title: 'Saisie de Votre Regard',
      desc: 'Une simple photo de votre visage permet de numériser la ligne naturelle de vos sourcils et l\'os de votre arcade.',
      icon: Camera,
    },
    {
      num: '2',
      title: 'Modélisation 3D Sur-Mesure',
      desc: 'Notre algorithme génère la réplique exacte de votre tracé sous forme d\'un calque de précision.',
      icon: Layers,
    },
    {
      num: '3',
      title: 'Tampon Individuel Fini',
      desc: 'Fabrication de votre applicateur en silicone souple et expédition à votre adresse avec paiement à la réception.',
      icon: Box,
    },
  ];

  return (
    <section id="comment-ca-marche" className="py-20 bg-gradient-to-b from-pearl-dark/30 via-pearl to-pearl border-t border-pearl-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center space-y-3 mb-16">
          <span className="text-xs font-serif italic tracking-widest text-roseGold uppercase px-3.5 py-1 rounded-full bg-roseGold-light border border-roseGold/20">
            Processus Simple & Transparent
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-charcoal">
            Comment Ça Marche ?
          </h2>
          <p className="text-sm text-charcoal-muted font-serif italic max-w-xl mx-auto">
            3 étapes simples pour obtenir votre tampon individuel sur-mesure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="p-8 rounded-3xl bg-pearl-card border border-pearl-border shadow-soft-luxury space-y-5 text-center flex flex-col items-center justify-between"
              >
                <div className="space-y-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-pearl border border-pearl-border flex items-center justify-center text-roseGold mx-auto shadow-sm">
                      <Icon className="w-8 h-8 text-roseGold" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-charcoal text-white font-serif font-bold text-xs flex items-center justify-center border-2 border-white">
                      {s.num}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-lg text-charcoal">
                    {s.title}
                  </h3>

                  <p className="text-xs text-charcoal-muted font-sans leading-relaxed">
                    {s.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-pearl-border/60 w-full flex items-center justify-center text-xs font-serif italic text-roseGold">
                  <span>Étape {s.num} sur 3</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
