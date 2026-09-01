'use client';

import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Cpu, Box } from 'lucide-react';

interface MainHeroSectionProps {
  onOrderClick: () => void;
  onExploreProcess: () => void;
}

export const MainHeroSection: React.FC<MainHeroSectionProps> = ({
  onOrderClick,
  onExploreProcess,
}) => {
  return (
    <section className="relative py-16 lg:py-24 bg-pearl overflow-hidden">
      
      {/* Soft Pearlescent Background Aura */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-tr from-purple-200/20 via-roseGold-light/40 to-blue-100/30 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="bg-pearl-card border border-pearl-border rounded-3xl p-8 lg:p-14 shadow-luxury grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Text */}
          <div className="lg:col-span-7 space-y-8 text-left">
            
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-100/80 via-roseGold-light to-blue-100/80 border border-white text-charcoal text-xs font-serif italic">
              <Sparkles className="w-3.5 h-3.5 text-roseGold" />
              <span>artistiQ • L'Évolution Cosmétique Haute Précision</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-charcoal leading-[1.15] uppercase">
              PRÉCISION, PURITÉ <br />
              <span className="italic font-serif font-normal text-roseGold">
                ET LA FINITION PARFAITE.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-charcoal-muted font-serif italic leading-relaxed max-w-xl">
              Vivez la prochaine évolution de l'art cosmétique. Notre technologie d'empreinte individuelle réplique la ligne exacte de vos sourcils dans un tampon en cristal et silicone ultra-doux.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={onOrderClick}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-purple-200 via-roseGold-light to-blue-200 text-charcoal font-serif tracking-widest text-xs uppercase font-bold shadow-pearlescent border border-white hover:opacity-90 transition-all flex items-center justify-center gap-3 group"
              >
                <span>COMMANDER LA COLLECTION</span>
                <ArrowRight className="w-4 h-4 text-charcoal group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onExploreProcess}
                className="w-full sm:w-auto px-6 py-4 rounded-xl bg-pearl border border-pearl-border text-charcoal font-serif tracking-widest text-xs uppercase font-semibold hover:bg-pearl-dark transition-all"
              >
                Découvrir le processus
              </button>
            </div>

            {/* Trust Badges */}
            <div className="pt-4 border-t border-pearl-border flex flex-wrap items-center gap-6 text-xs text-charcoal-muted font-serif italic">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-roseGold" /> Silicone Medical Bio-Adaptatif
              </span>
              <span className="flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-roseGold" /> Gravure Micronique
              </span>
              <span className="flex items-center gap-1.5">
                <Box className="w-4 h-4 text-roseGold" /> Application 5 secondes
              </span>
            </div>

          </div>

          {/* Right Product Crystal Cube Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-pearl via-pearl-dark to-pearl-card border border-pearl-border p-8 shadow-luxury text-center space-y-6">
              
              <div className="p-8 rounded-2xl bg-white/80 border border-pearl-border shadow-sm space-y-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-purple-100 via-roseGold-light to-blue-100 p-0.5 mx-auto shadow-pearlescent">
                  <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                    <Box className="w-10 h-10 text-roseGold" />
                  </div>
                </div>

                <div>
                  <h3 className="font-serif font-bold text-lg text-charcoal">
                    Tampon Cristal Sur-Mesure
                  </h3>
                  <p className="text-xs text-charcoal-muted font-serif italic mt-1">
                    Pièce individuelle en silicone cosmétique haute densité
                  </p>
                </div>
              </div>

              <div className="text-xs font-serif italic text-charcoal-muted bg-pearl-dark/60 p-3 rounded-xl border border-pearl-border">
                "Une symétrie absolue et un tracé identique chaque matin."
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
