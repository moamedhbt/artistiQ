'use client';

import React, { useState } from 'react';
import { MoveHorizontal, CheckCircle2, AlertCircle } from 'lucide-react';

export const BeforeAfterSlider: React.FC = () => {
  const [sliderX, setSliderX] = useState<number>(50); // percentage 0 - 100

  const handleMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderX(percent);
  };

  return (
    <section className="py-20 bg-obsidian relative overflow-hidden border-t border-obsidian-border">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-serif italic tracking-widest text-roseGold uppercase px-3.5 py-1 rounded-full bg-obsidian-card border border-roseGold/30 shadow-rose-glow">
            Démonstration d'Efficacité
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white uppercase">
            Avant / Après : La Différence ARTISTIQ
          </h2>
          <p className="text-sm text-gray-300 font-serif italic max-w-lg mx-auto">
            Faites glisser le curseur pour observer la perfection du tracé répliqué en 5 secondes.
          </p>
        </div>

        {/* Clean Interactive Horizontal Split Frame */}
        <div
          onMouseMove={handleMove}
          onTouchMove={handleMove}
          className="relative aspect-[16/9] sm:aspect-[2/1] rounded-3xl overflow-hidden border border-obsidian-border shadow-cyber-luxury cursor-col-resize select-none bg-obsidian-card"
        >
          {/* AFTER LAYER (Right Side / Rose Gold & Pearl Glow) */}
          <div className="absolute inset-0 bg-gradient-to-r from-obsidian-card via-obsidian-light to-obsidian border-l border-roseGold flex items-center justify-end p-8 text-right">
            <div className="space-y-3 max-w-xs pr-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-roseGold text-obsidian text-[10px] font-serif uppercase tracking-widest font-bold shadow-rose-glow">
                <CheckCircle2 className="w-3.5 h-3.5" /> Après • Tampon ARTISTIQ
              </span>
              <h3 className="font-serif font-bold text-xl sm:text-3xl text-white">
                100% Symétrique & Identique
              </h3>
              <p className="text-xs text-gray-300 font-serif italic">
                Application en 5 secondes. Un tracé identique sur les deux yeux chaque matin.
              </p>
            </div>
          </div>

          {/* BEFORE LAYER (Left Side / Dark Charcoal) */}
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-obsidian via-obsidian-card to-obsidian-border border-r-2 border-roseGold flex items-center justify-start p-8 text-left overflow-hidden transition-all duration-75 shadow-rose-glow"
            style={{ width: `${sliderX}%` }}
          >
            <div className="space-y-3 max-w-xs min-w-[280px] pl-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-obsidian-light border border-obsidian-border text-gray-400 text-[10px] font-serif uppercase tracking-widest font-bold">
                <AlertCircle className="w-3.5 h-3.5 text-roseGold" /> Avant • Maquillage Crayon
              </span>
              <h3 className="font-serif font-bold text-xl sm:text-3xl text-gray-300">
                15 Minutes de Retouches
              </h3>
              <p className="text-xs text-gray-400 font-serif italic">
                Asymétrie naturelle et perte de temps quotidienne devant le miroir.
              </p>
            </div>
          </div>

          {/* SLIDER HANDLE */}
          <div
            className="absolute inset-y-0 -ml-4 flex items-center justify-center pointer-events-none"
            style={{ left: `${sliderX}%` }}
          >
            <div className="w-9 h-9 rounded-full bg-obsidian border-2 border-roseGold shadow-rose-glow flex items-center justify-center text-roseGold">
              <MoveHorizontal className="w-4 h-4" />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
