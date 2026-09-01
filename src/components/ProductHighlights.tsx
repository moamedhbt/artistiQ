'use client';

import React from 'react';
import { HeartHandshake, Zap, RefreshCw } from 'lucide-react';

export const ProductHighlights: React.FC = () => {
  const highlights = [
    {
      title: 'Adaptabilité Morphologique',
      text: 'Épouse parfaitement les courbes du visage grâce à sa structure polymère flexible.',
      icon: HeartHandshake,
    },
    {
      title: 'Gain de Temps Ultime',
      text: 'Dessinez ou intensifiez vos sourcils en moins de 3 secondes avec une symétrie chirurgicale.',
      icon: Zap,
    },
    {
      title: 'Durabilité Éco-Conçue',
      text: 'Un outil réutilisable à vie, lavable à l\'eau tiède et au savon doux.',
      icon: RefreshCw,
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-pearl-dark/30 via-pearl to-pearl border-t border-pearl-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center space-y-3 mb-16">
          <span className="text-xs font-serif italic tracking-widest text-roseGold uppercase px-3.5 py-1 rounded-full bg-roseGold-light border border-roseGold/20">
            Avantages Exclusifs
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-charcoal uppercase">
            Pourquoi Choisir ARTISTIQ
          </h2>
          <p className="text-sm text-charcoal-muted font-serif italic max-w-xl mx-auto">
            La synergie entre l'élégance cosmétique et l'ingénierie de pointe.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {highlights.map((h, idx) => {
            const Icon = h.icon;
            return (
              <div
                key={idx}
                className="p-8 rounded-3xl bg-pearl-card border border-pearl-border shadow-soft-luxury space-y-4 text-center flex flex-col items-center justify-between hover:border-roseGold/40 transition-all"
              >
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-roseGold-light border border-roseGold/20 flex items-center justify-center text-roseGold mx-auto shadow-rose-glow">
                    <Icon className="w-8 h-8" />
                  </div>

                  <h3 className="font-serif font-bold text-lg text-charcoal">
                    {h.title}
                  </h3>

                  <p className="text-xs text-charcoal-muted font-sans leading-relaxed">
                    {h.text}
                  </p>
                </div>

                <div className="pt-4 border-t border-pearl-border/80 w-full text-xs font-serif italic text-roseGold">
                  Inégalé sur le marché
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
