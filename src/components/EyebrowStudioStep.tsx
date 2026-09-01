'use client';

import React, { useState } from 'react';
import { EyebrowCustomParams, BiometricMeasurements } from '@/types';
import { generateEyebrowSvgPath } from '@/lib/biometrics';
import { Sliders, Sparkles, ArrowRight, RotateCcw, CheckCircle2, Layers } from 'lucide-react';

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
  const [params, setParams] = useState<EyebrowCustomParams>({
    ...initialParams,
    originalThicknessMm: initialParams.originalThicknessMm || 6.5,
    originalLengthMm: initialParams.originalLengthMm || biometrics.leftEyebrowLengthMm,
    originalArchHeightMm: initialParams.originalArchHeightMm || biometrics.leftArchHeightMm,
    originalInterGapMm: initialParams.originalInterGapMm || biometrics.interEyebrowGapMm,
  });

  const handleResetToOriginal = () => {
    setParams({
      ...params,
      thicknessMm: params.originalThicknessMm || 6.5,
      lengthMm: params.originalLengthMm || biometrics.leftEyebrowLengthMm,
      archHeightMm: params.originalArchHeightMm || biometrics.leftArchHeightMm,
      interGapMm: params.originalInterGapMm || biometrics.interEyebrowGapMm,
    });
  };

  const originalParams = {
    thicknessMm: params.originalThicknessMm || 6.5,
    lengthMm: params.originalLengthMm || biometrics.leftEyebrowLengthMm,
    archHeightMm: params.originalArchHeightMm || biometrics.leftArchHeightMm,
    tailDropMm: 4.0,
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      
      {/* Header */}
      <div className="text-center space-y-2 mb-8">
        <span className="text-xs font-serif italic tracking-widest text-roseGold uppercase px-3.5 py-1 rounded-full bg-roseGold-light border border-roseGold/20">
          Étape 3 sur 4 • Superposition & Personnalisation (Calque)
        </span>
        <h2 className="text-3xl font-serif font-bold text-charcoal">
          Ajustement Précis de Votre Empreinte
        </h2>
        <p className="text-sm text-charcoal-muted font-serif italic max-w-xl mx-auto">
          Comparez en direct la ligne naturelle de vos sourcils (pointillés) avec vos retouches de maquillage personnalisées (ligne pleine).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Sliders */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="p-6 rounded-3xl bg-pearl-card border border-pearl-border space-y-5 shadow-soft-luxury">
            <div className="flex items-center justify-between border-b border-pearl-border pb-3">
              <h3 className="font-serif font-bold text-sm text-charcoal flex items-center gap-2">
                <Sliders className="w-4 h-4 text-roseGold" />
                Réglage de la Finesse & des Contours
              </h3>
              <button
                onClick={handleResetToOriginal}
                className="text-[11px] text-roseGold hover:underline flex items-center gap-1 font-serif italic"
              >
                <RotateCcw className="w-3 h-3" /> Revenir à l'original
              </button>
            </div>

            {/* Thickness */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-charcoal font-medium">Épaisseur (Générosité du tracé)</span>
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
                <span className="text-charcoal font-medium">Hauteur d'Arcade (Courbure/Lift)</span>
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
                <span className="text-charcoal font-medium">Longueur Totale</span>
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

            {/* Inter Gap */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-charcoal font-medium">Écartement Central (Inter-sourcils)</span>
                <span className="font-serif text-roseGold font-bold">{params.interGapMm.toFixed(1)} mm</span>
              </div>
              <input
                type="range"
                min={18.0}
                max={32.0}
                step={0.1}
                value={params.interGapMm}
                onChange={(e) => setParams({ ...params, interGapMm: parseFloat(e.target.value) })}
                className="w-full accent-roseGold bg-pearl-dark rounded-lg h-2 cursor-pointer"
              />
            </div>

          </div>

        </div>

        {/* Right Preview: TRACING PAPER ("CALQUE") DOUBLE LAYER CANVAS */}
        <div className="lg:col-span-5 sticky top-24 space-y-6">
          <div className="p-6 rounded-3xl bg-pearl-card border border-pearl-border shadow-soft-luxury space-y-4 text-center">
            
            <div className="flex items-center justify-between text-xs text-charcoal border-b border-pearl-border pb-3 font-serif italic">
              <span className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-roseGold" />
                Effet Calque Comparatif
              </span>
              <span className="text-roseGold font-semibold">Superposition</span>
            </div>

            {/* Double Layer SVG Canvas */}
            <div className="p-4 rounded-2xl bg-pearl border border-pearl-border relative overflow-hidden flex flex-col items-center justify-center min-h-[220px]">
              
              <div className="w-full flex items-center justify-center gap-4 py-4 relative">
                
                {/* Left Eyebrow Double Overlay */}
                <div className="relative w-36 h-20">
                  {/* CALQUE 1: ORIGINAL BROW (Dotted Line) */}
                  <svg viewBox="0 0 160 80" className="absolute inset-0 w-full h-full text-charcoal/40 fill-none stroke-current">
                    <path
                      d={generateEyebrowSvgPath(originalParams, 'left', 160, 80)}
                      strokeWidth="2"
                      strokeDasharray="4 3"
                      strokeLinecap="round"
                    />
                  </svg>

                  {/* CALQUE 2: MODIFIED CUSTOM BROW (Solid Line) */}
                  <svg viewBox="0 0 160 80" className="absolute inset-0 w-full h-full text-roseGold fill-roseGold/20 stroke-roseGold">
                    <path
                      d={generateEyebrowSvgPath(params, 'left', 160, 80)}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <div className="text-[10px] font-serif italic text-charcoal-muted border-x border-pearl-border px-1 py-4">
                  Axe
                </div>

                {/* Right Eyebrow Double Overlay */}
                <div className="relative w-36 h-20">
                  {/* CALQUE 1: ORIGINAL BROW (Dotted Line) */}
                  <svg viewBox="0 0 160 80" className="absolute inset-0 w-full h-full text-charcoal/40 fill-none stroke-current">
                    <path
                      d={generateEyebrowSvgPath(originalParams, 'right', 160, 80)}
                      strokeWidth="2"
                      strokeDasharray="4 3"
                      strokeLinecap="round"
                    />
                  </svg>

                  {/* CALQUE 2: MODIFIED CUSTOM BROW (Solid Line) */}
                  <svg viewBox="0 0 160 80" className="absolute inset-0 w-full h-full text-roseGold fill-roseGold/20 stroke-roseGold">
                    <path
                      d={generateEyebrowSvgPath(params, 'right', 160, 80)}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

              </div>

              {/* Legend for Tracing Overlay */}
              <div className="w-full pt-3 border-t border-pearl-border/80 flex items-center justify-around text-[10px] font-serif italic text-charcoal-muted">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-charcoal/50 border-t border-dashed" />
                  Originale Scannée
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-1 bg-roseGold rounded-full" />
                  Votre Retouche
                </span>
              </div>

            </div>

            <div className="p-3.5 rounded-2xl bg-pearl border border-pearl-border text-left space-y-1.5 text-xs text-charcoal">
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
                <span>Modifications enregistrées pour la confection 3D</span>
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
