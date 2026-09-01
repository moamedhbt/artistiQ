'use client';

import React, { useState } from 'react';
import { MoveVertical, Sparkles } from 'lucide-react';

export const BeforeAfterSlider: React.FC = () => {
  const [sliderY, setSliderY] = useState<number>(50); // percentage 0 - 100

  const handleVerticalMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const y = Math.max(0, Math.min(clientY - rect.top, rect.height));
    const percent = (y / rect.height) * 100;
    setSliderY(percent);
  };

  return (
    <section className="py-20 bg-pearl relative overflow-hidden border-t border-pearl-border">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-serif italic tracking-widest text-roseGold uppercase px-3.5 py-1 rounded-full bg-roseGold-light border border-roseGold/20">
            Démonstration 3D Verticale
          </span>
          <h2 className="text-3xl font-serif font-bold text-charcoal">
            Avant / Après : La Différence artistiQ
          </h2>
          <p className="text-sm text-charcoal-muted font-serif italic max-w-lg mx-auto">
            Faites glisser le curseur verticalement du haut vers le bas pour observer la réplique 3D parfaite.
          </p>
        </div>

        {/* Vertical 3D Comparison Frame */}
        <div
          onMouseMove={handleVerticalMove}
          onTouchMove={handleVerticalMove}
          className="relative aspect-[3/4] sm:aspect-[16/10] rounded-3xl overflow-hidden border border-pearl-border shadow-luxury cursor-row-resize select-none bg-pearl-dark"
        >
          {/* AFTER LAYER (Bottom / Rose Gold & Pearl Glow) */}
          <div className="absolute inset-0 bg-gradient-to-b from-roseGold-light/50 via-pearl to-pearl-card flex flex-col items-center justify-center p-8 text-center space-y-4">
            <span className="px-3.5 py-1 rounded-full bg-roseGold text-white text-[10px] font-serif uppercase tracking-widest font-bold shadow-sm">
              Après • Tampon 3D artistiQ Appliqué
            </span>
            <h3 className="font-serif font-bold text-2xl sm:text-4xl text-charcoal max-w-md">
              Symétrie Absolue & Ligne Parfaite
            </h3>
            <p className="text-xs sm:text-sm text-charcoal-muted font-serif italic max-w-sm">
              Application en 5 secondes. Identique sur les deux yeux, chaque matin sans effort.
            </p>
          </div>

          {/* BEFORE LAYER (Top / Darker / Daily struggle) */}
          <div
            className="absolute inset-x-0 top-0 bg-gradient-to-b from-pearl-dark via-pearl border-b-2 border-roseGold flex flex-col items-center justify-center p-8 text-center overflow-hidden transition-all duration-75 shadow-rose-glow"
            style={{ height: `${sliderY}%` }}
          >
            <div className="space-y-4 max-w-md min-h-[200px] flex flex-col items-center justify-center">
              <span className="px-3.5 py-1 rounded-full bg-charcoal text-white text-[10px] font-serif uppercase tracking-widest font-bold">
                Avant • Maquillage Crayon Classique
              </span>
              <h3 className="font-serif font-bold text-2xl sm:text-4xl text-charcoal/80">
                15 Minutes de Retouches Inégales
              </h3>
              <p className="text-xs sm:text-sm text-charcoal-muted font-serif italic">
                Asymétrie naturelle et difficulté à reproduire le tracé chaque matin.
              </p>
            </div>
          </div>

          {/* VERTICAL SLIDER HANDLE */}
          <div
            className="absolute inset-x-0 -mt-4 flex items-center justify-center pointer-events-none"
            style={{ top: `${sliderY}%` }}
          >
            <div className="w-10 h-10 rounded-full bg-white border-2 border-roseGold shadow-rose-glow flex items-center justify-center text-roseGold">
              <MoveVertical className="w-5 h-5" />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
