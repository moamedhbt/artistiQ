'use client';

import React, { useState } from 'react';
import { EyebrowCustomParams, BiometricMeasurements } from '@/types';
import { generateEyebrowSvgPath } from '@/lib/biometrics';
import { Sliders, Sparkles, ArrowRight, RotateCcw, CheckCircle2, ShieldCheck } from 'lucide-react';

interface EyebrowStudioStepProps {
  biometrics: BiometricMeasurements;
  initialParams: EyebrowCustomParams;
  onNext: (params: EyebrowCustomParams) => void;
  onBack: () => void;
}

export const EyebrowStudioStep: React.FC<EyebrowStudioStepProps> = ({
  biometrics,
  initialParams,
  onNext,
  onBack,
}) => {
  const [params, setParams] = useState<EyebrowCustomParams>(initialParams);

  const handleResetToNatural = () => {
    setParams({
      ...params,
      thicknessMm: 6.5,
      lengthMm: biometrics.leftEyebrowLengthMm,
      archHeightMm: biometrics.leftArchHeightMm,
      interGapMm: biometrics.interEyebrowGapMm,
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      
      {/* Header */}
      <div className="text-center space-y-2 mb-8">
        <span className="text-xs font-serif italic tracking-widest text-roseGold uppercase px-3.5 py-1 rounded-full bg-roseGold-light border border-roseGold/20">
          Étape 3 sur 4 • Empreinte Naturelle Numérisée
        </span>
        <h2 className="text-3xl font-serif font-bold text-charcoal">
          Voici le Tracé Exact de Votre Regard
        </h2>
        <p className="text-sm text-charcoal-muted font-serif italic max-w-xl mx-auto">
          Voici la réplique exacte de vos sourcils telle qu'analysée par le miroir digital. Vous pouvez ajuster la finesse du maquillage si vous le souhaitez.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Replicated Natural Brow Banner & Micro Sliders */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Exact Replica Card Banner */}
          <div className="p-6 rounded-3xl bg-pearl-card border border-roseGold shadow-soft-luxury space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-serif italic font-bold text-roseGold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-roseGold" /> Réplique 1:1 de Votre Regard
              </span>
              <span className="text-[10px] font-sans px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-medium">
                Symétrie {biometrics.facialSymmetryIndex}%
              </span>
            </div>
            <h3 className="font-serif font-bold text-lg text-charcoal">
              Empreinte Morphologique Individuelle
            </h3>
            <p className="text-xs text-charcoal-muted font-serif italic leading-relaxed">
              Votre tampon est façonné pour correspondre 1:1 à la ligne naturelle de vos sourcils, garantissant un maquillage parfaitement identique et symétrique chaque matin.
            </p>
          </div>

          {/* Micro Adjustments */}
          <div className="p-6 rounded-3xl bg-pearl-card border border-pearl-border space-y-5 shadow-soft-luxury">
            <div className="flex items-center justify-between border-b border-pearl-border pb-3">
              <h3 className="font-serif font-bold text-sm text-charcoal flex items-center gap-2">
                <Sliders className="w-4 h-4 text-roseGold" />
                Ajustement de l'Intensité du Maquillage
              </h3>
              <button
                onClick={handleResetToNatural}
                className="text-[11px] text-roseGold hover:underline flex items-center gap-1 font-serif italic"
              >
                <RotateCcw className="w-3 h-3" /> Remettre à zéro
              </button>
            </div>

            {/* Thickness */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-charcoal font-medium">Épaisseur du Tracé (Fin ou Généreux)</span>
                <span className="font-serif text-roseGold font-bold">{params.thicknessMm.toFixed(1)} mm</span>
              </div>
              <input
                type="range"
                min={4.0}
                max={10.0}
                step={0.1}
                value={params.thicknessMm}
                onChange={(e) => setParams({ ...params, thicknessMm: parseFloat(e.target.value) })}
                className="w-full accent-roseGold bg-pearl-dark rounded-lg h-2 cursor-pointer"
              />
            </div>

            {/* Arch Height */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-charcoal font-medium">Hauteur de l'Arcade Naturelle</span>
                <span className="font-serif text-roseGold font-bold">{params.archHeightMm.toFixed(1)} mm</span>
              </div>
              <input
                type="range"
                min={8.0}
                max={22.0}
                step={0.1}
                value={params.archHeightMm}
                onChange={(e) => setParams({ ...params, archHeightMm: parseFloat(e.target.value) })}
                className="w-full accent-roseGold bg-pearl-dark rounded-lg h-2 cursor-pointer"
              />
            </div>

            {/* Length */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-charcoal font-medium">Longueur de la Ligne</span>
                <span className="font-serif text-roseGold font-bold">{params.lengthMm.toFixed(1)} mm</span>
              </div>
              <input
                type="range"
                min={40.0}
                max={65.0}
                step={0.1}
                value={params.lengthMm}
                onChange={(e) => setParams({ ...params, lengthMm: parseFloat(e.target.value) })}
                className="w-full accent-roseGold bg-pearl-dark rounded-lg h-2 cursor-pointer"
              />
            </div>

          </div>

        </div>

        {/* Right Preview */}
        <div className="lg:col-span-5 sticky top-24 space-y-6">
          <div className="p-6 rounded-3xl bg-pearl-card border border-pearl-border shadow-soft-luxury space-y-4 text-center">
            
            <div className="flex items-center justify-between text-xs text-charcoal border-b border-pearl-border pb-3 font-serif italic">
              <span>Rendu de l'Empreinte</span>
              <span>Aperçu Répliqué</span>
            </div>

            <div className="p-4 rounded-2xl bg-pearl border border-pearl-border relative overflow-hidden flex flex-col items-center justify-center min-h-[200px]">
              
              <p className="text-[11px] font-serif italic text-roseGold mb-2">
                Votre Tracé Exact Répliqué
              </p>

              <div className="w-full flex items-center justify-center gap-4 py-4">
                <svg viewBox="0 0 160 80" className="w-36 h-20 text-roseGold fill-roseGold/20 stroke-roseGold">
                  <path
                    d={generateEyebrowSvgPath(params, 'left', 160, 80)}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                <div className="text-[10px] font-serif italic text-charcoal-muted border-x border-pearl-border px-1 py-4">
                  Axe
                </div>

                <svg viewBox="0 0 160 80" className="w-36 h-20 text-roseGold fill-roseGold/20 stroke-roseGold">
                  <path
                    d={generateEyebrowSvgPath(params, 'right', 160, 80)}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

            </div>

            <div className="p-3.5 rounded-2xl bg-pearl border border-pearl-border text-left space-y-1.5 text-xs text-charcoal">
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
                <span>100% fidèle à votre ligne naturelle</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
                <span>Adaptation parfaite à l'os de votre arcade</span>
              </div>
            </div>

            {/* Action button */}
            <button
              onClick={() => onNext(params)}
              className="w-full py-4 rounded-xl bg-charcoal-button hover:bg-charcoal-buttonHover text-white font-serif tracking-widest text-xs uppercase font-bold shadow-button-shadow border border-roseGold/30 transition-all flex items-center justify-center gap-2"
            >
              <span>VISUALISER MON TAMPON SUR-MESURE</span>
              <ArrowRight className="w-4 h-4 text-roseGold" />
            </button>

            <button
              onClick={onBack}
              className="text-xs text-charcoal-muted hover:text-charcoal underline transition-colors block mx-auto pt-1 font-serif italic"
            >
              ← Revenir à l'analyse
            </button>

          </div>
        </div>

      </div>
    </div>
  );
};
