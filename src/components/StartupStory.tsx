'use client';

import React from 'react';
import { Sparkles, ShieldCheck, HeartHandshake, Award } from 'lucide-react';

export const StartupStory: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-pearl to-pearl-dark/40 border-y border-pearl-border relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text Story */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <span className="text-xs font-serif italic tracking-widest text-roseGold uppercase px-3.5 py-1 rounded-full bg-roseGold-light border border-roseGold/20">
              Notre Histoire • L'Innovation Beauty-Tech
            </span>

            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-charcoal leading-tight">
              La Maison <span className="text-roseGold italic">artistiQ</span> : L'Équilibre Parfait Entre Beauté & Technologie
            </h2>

            <p className="text-sm sm:text-base text-charcoal-muted leading-relaxed font-serif italic">
              Née d'une ambition simple : supprimer la frustration quotidienne des sourcils asymétriques. Chaque matin, des millions de femmes passent entre 15 et 20 minutes devant leur miroir pour tenter d'égaliser la ligne de leur regard.
            </p>

            <p className="text-xs sm:text-sm text-charcoal/80 leading-relaxed font-sans">
              Chez <strong className="font-semibold text-charcoal">artistiQ</strong>, nous avons fusionné la vision par ordinateur et la science des polymères médicaux pour créer le tout premier <strong className="font-semibold text-roseGold">tampon en silicone souple 100% sur-mesure</strong>. En capturant la courbure exacte de l'os de votre arcade, notre technologie reproduit un tracé d'une précision chirurgicale en 5 secondes chrono.
            </p>

            {/* Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="p-4 rounded-2xl bg-pearl-card border border-pearl-border shadow-sm space-y-1">
                <Award className="w-5 h-5 text-roseGold mb-1" />
                <p className="text-xs font-serif font-bold text-charcoal">Haute Précision 0.1 mm</p>
                <p className="text-[11px] text-charcoal-muted">Cartographie exacte de l'arcade</p>
              </div>

              <div className="p-4 rounded-2xl bg-pearl-card border border-pearl-border shadow-sm space-y-1">
                <HeartHandshake className="w-5 h-5 text-roseGold mb-1" />
                <p className="text-xs font-serif font-bold text-charcoal">Silicone Pharmacie</p>
                <p className="text-[11px] text-charcoal-muted">Doux, hypoallergénique, lavable</p>
              </div>

              <div className="p-4 rounded-2xl bg-pearl-card border border-pearl-border shadow-sm space-y-1">
                <ShieldCheck className="w-5 h-5 text-roseGold mb-1" />
                <p className="text-xs font-serif font-bold text-charcoal">Paiement Livraison</p>
                <p className="text-[11px] text-charcoal-muted">Satisfaction garantie à domicile</p>
              </div>
            </div>

          </div>

          {/* Right Visual Card Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden bg-pearl-card border border-pearl-border p-8 shadow-soft-luxury space-y-6 text-center">
              
              <div className="w-16 h-16 rounded-2xl bg-roseGold-light border border-roseGold/30 flex items-center justify-center text-roseGold mx-auto shadow-rose-glow">
                <Sparkles className="w-8 h-8 animate-pulse" />
              </div>

              <div className="space-y-2">
                <p className="text-xs font-serif italic text-roseGold uppercase tracking-widest">
                  Science & Beauté Individualisée
                </p>
                <h3 className="text-xl font-serif font-bold text-charcoal">
                  Conçu Pour Vous, & Uniquement Pour Vous.
                </h3>
                <p className="text-xs text-charcoal-muted leading-relaxed font-serif italic">
                  Aucun visage n'étant identique, il n'existe pas de pochoir universel. Votre tampon artistiQ est une pièce unique moulée d'après l'empreinte de votre propre morphologie.
                </p>
              </div>

              <div className="pt-4 border-t border-pearl-border flex justify-around text-xs font-serif italic text-charcoal-muted">
                <div>
                  <span className="block font-bold text-roseGold text-lg font-sans">100%</span>
                  <span>Sur-Mesure</span>
                </div>
                <div>
                  <span className="block font-bold text-roseGold text-lg font-sans">5 sec</span>
                  <span>Application</span>
                </div>
                <div>
                  <span className="block font-bold text-roseGold text-lg font-sans">∞</span>
                  <span>Réutilisable</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
