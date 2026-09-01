'use client';

import React, { useState } from 'react';
import { Sparkles, MoveHorizontal } from 'lucide-react';

export const BeforeAfterSlider: React.FC = () => {
  const [sliderPosition, setSliderPosition] = useState<number>(50);

  const handleSliderMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPosition(percent);
  };

  return (
    <section className="py-16 bg-pearl relative overflow-hidden border-t border-pearl-border">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center space-y-3 mb-10">
          <span className="text-xs font-serif italic tracking-widest text-roseGold uppercase px-3.5 py-1 rounded-full bg-roseGold-light border border-roseGold/20">
            Résultat Instantané
          </span>
          <h2 className="text-3xl font-serif font-bold text-charcoal">
            Avant / Après : La Différence artistiQ
          </h2>
          <p className="text-sm text-charcoal-muted font-serif italic max-w-lg mx-auto">
            Faites glisser le curseur pour observer la perfection du tracé répliqué en 5 secondes.
          </p>
        </div>

        {/* Interactive Before/After Frame */}
        <div
          onMouseMove={handleSliderMove}
          onTouchMove={handleSliderMove}
          className="relative aspect-[16/9] sm:aspect-[2/1] rounded-3xl overflow-hidden border border-pearl-border shadow-soft-luxury cursor-col-resize select-none bg-pearl-dark"
        >
          {/* AFTER LAYER (Right / Custom Stamp Application) */}
          <div className="absolute inset-0 bg-gradient-to-r from-roseGold-light/40 via-pearl to-pearl flex items-center justify-center p-8 text-center">
            <div className="space-y-3 max-w-xs">
              <span className="px-3 py-1 rounded-full bg-roseGold text-white text-[10px] font-serif uppercase tracking-widest font-bold">
                Après • Avec le Tampon artistiQ
              </span>
              <p className="font-serif font-bold text-2xl sm:text-3xl text-charcoal">
                100% Symétrique & Identique
              </p>
              <p className="text-xs text-charcoal-muted font-serif italic">
                Tracé parfait en 5 secondes chaque matin.
              </p>
            </div>
          </div>

          {/* BEFORE LAYER (Left / Daily struggle) */}
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-pearl-dark via-pearl-dark to-pearl-border/80 border-r-2 border-roseGold flex items-center justify-center p-8 text-center overflow-hidden transition-all duration-75"
            style={{ width: `${sliderPosition}%` }}
          >
            <div className="space-y-3 max-w-xs min-w-[280px]">
              <span className="px-3 py-1 rounded-full bg-charcoal text-white text-[10px] font-serif uppercase tracking-widest font-bold">
                Avant • Maquillage Crayon Classique
              </span>
              <p className="font-serif font-bold text-2xl sm:text-3xl text-charcoal/70">
                15 Minutes de Retouches
              </p>
              <p className="text-xs text-charcoal-muted font-serif italic">
                Lignes inégales et asymétrie quotidienne.
              </p>
            </div>
          </div>

          {/* SLIDER HANDLE */}
          <div
            className="absolute inset-y-0 -ml-4 flex items-center justify-center pointer-events-none"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="w-9 h-9 rounded-full bg-white border-2 border-roseGold shadow-rose-glow flex items-center justify-center text-roseGold">
              <MoveHorizontal className="w-4 h-4" />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
