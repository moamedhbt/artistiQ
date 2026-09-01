'use client';

import React from 'react';
import { HeartHandshake, Zap, RefreshCw } from 'lucide-react';

export const ProductSignatures: React.FC = () => {
  const signatures = [
    {
      title: 'Anatomie Flexible',
      text: 'S\'adapte instantanément à la courbure unique de votre visage grâce à une structure élastomère ultra-douce.',
      icon: HeartHandshake,
    },
    {
      title: 'Symétrie Absolue en 3 Secondes',
      text: 'Un tracé impeccable et un remplissage parfait d\'un seul geste, chaque matin.',
      icon: Zap,
    },
    {
      title: 'Éco-Conception Durable',
      text: 'Conçu pour durer toute une vie. Élimine le gaspillage des stencils jetables.',
      icon: RefreshCw,
    },
  ];

  return (
    <section id="experience" className="py-20 bg-gradient-to-b from-obsidian-light/30 via-obsidian to-obsidian border-t border-obsidian-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center space-y-3 mb-16">
          <span className="text-xs font-serif italic tracking-widest text-roseGold uppercase px-3.5 py-1 rounded-full bg-obsidian-card border border-roseGold/30 shadow-rose-glow">
            Signatures Produit
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white uppercase">
            L'EXCELLENCE ARTISTIQ
          </h2>
          <p className="text-sm text-gray-300 font-serif italic max-w-xl mx-auto">
            Pourquoi le tampon sur-mesure ARTISTIQ est unique au monde.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {signatures.map((sig, idx) => {
            const Icon = sig.icon;
            return (
              <div
                key={idx}
                className="p-8 rounded-3xl bg-obsidian-card border border-obsidian-border shadow-cyber-luxury space-y-4 text-center flex flex-col items-center justify-between hover:border-roseGold/40 transition-all"
              >
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-obsidian border border-roseGold/30 flex items-center justify-center text-roseGold mx-auto shadow-rose-glow">
                    <Icon className="w-8 h-8" />
                  </div>

                  <h3 className="font-serif font-bold text-lg text-white">
                    {sig.title}
                  </h3>

                  <p className="text-xs text-gray-300 font-sans leading-relaxed">
                    {sig.text}
                  </p>
                </div>

                <div className="pt-4 border-t border-obsidian-border w-full text-xs font-serif italic text-roseGold">
                  Signature Haute-Couture
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
