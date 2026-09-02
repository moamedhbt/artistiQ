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
      
      {/* Header — Obsidian Dark Theme */}
      <div className="text-center space-y-2 mb-8">
        <span className="text-xs font-serif italic tracking-widest text-roseGold uppercase px-3.5 py-1 rounded-full bg-roseGold/10 border border-roseGold/30">
          Étape 3 sur 4 • Superposition & Personnalisation (Calque)
        </span>
        <h2 className="text-3xl font-serif font-bold text-white">
          Ajustement Précis de Votre Empreinte
        </h2>
        <p className="text-sm text-gray-200 font-medium font-serif italic max-w-xl mx-auto">
          Comparez en direct la ligne naturelle de vos sourcils (pointillés) avec vos retouches de maquillage personnalisées (ligne pleine).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Sliders — Obsidian Dark Cards */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="p-6 rounded-3xl bg-obsidian-card border border-obsidian-border space-y-5 shadow-card-glow">
            <div className="flex items-center justify-between border-b border-obsidian-border pb-3">
              <h3 className="font-serif font-bold text-sm text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-roseGold" />
                Réglage de la Finesse & des Contours
              </h3>
              <button
                onClick={handleResetToOriginal}
                className="text-[11px] text-roseGold hover:text-roseGold-light underline flex items-center gap-1 font-serif italic transition-colors"
              >
                <RotateCcw className="w-3 h-3" /> Revenir à l&apos;original
              </button>
            </div>

            {/* Thickness */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-white font-semibold">Épaisseur (Générosité du tracé)</span>
                <span className="font-serif text-roseGold font-bold">{params.thicknessMm.toFixed(1)} mm</span>
              </div>
              <input
                type="range"
                min={4.0}
                max={10.0}
                step={0.1}
                value={params.thicknessMm}
                onChange={(e) => setParams({ ...params, thicknessMm: parseFloat(e.target.value) })}
                className="w-full accent-roseGold bg-obsidian-light rounded-lg h-2.5 cursor-pointer"
              />
            </div>

            {/* Arch Height */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-white font-semibold">Hauteur d&apos;Arcade (Courbure/Lift)</span>
                <span className="font-serif text-roseGold font-bold">{params.archHeightMm.toFixed(1)} mm</span>
              </div>
              <input
                type="range"
                min={8.0}
                max={22.0}
                step={0.1}
                value={params.archHeightMm}
                onChange={(e) => setParams({ ...params, archHeightMm: parseFloat(e.target.value) })}
                className="w-full accent-roseGold bg-obsidian-light rounded-lg h-2.5 cursor-pointer"
              />
            </div>

            {/* Length */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-white font-semibold">Longueur Totale</span>
                <span className="font-serif text-roseGold font-bold">{params.lengthMm.toFixed(1)} mm</span>
              </div>
              <input
                type="range"
                min={40.0}
                max={65.0}
                step={0.1}
                value={params.lengthMm}
                onChange={(e) => setParams({ ...params, lengthMm: parseFloat(e.target.value) })}
                className="w-full accent-roseGold bg-obsidian-light rounded-lg h-2.5 cursor-pointer"
              />
            </div>

            {/* Inter Gap */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-white font-semibold">Écartement Central (Inter-sourcils)</span>
                <span className="font-serif text-roseGold font-bold">{params.interGapMm.toFixed(1)} mm</span>
              </div>
              <input
                type="range"
                min={18.0}
                max={32.0}
                step={0.1}
                value={params.interGapMm}
                onChange={(e) => setParams({ ...params, interGapMm: parseFloat(e.target.value) })}
                className="w-full accent-roseGold bg-obsidian-light rounded-lg h-2.5 cursor-pointer"
              />
            </div>

          </div>

        </div>

        {/* Right Preview: TRACING PAPER — Obsidian Dark Theme */}
        <div className="lg:col-span-5 sticky top-24 space-y-6">
          <div className="p-6 rounded-3xl bg-obsidian-card border border-obsidian-border shadow-card-glow space-y-4 text-center">
            
            <div className="flex items-center justify-between text-xs text-white border-b border-obsidian-border pb-3 font-serif italic">
              <span className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-roseGold" />
                Effet Calque Comparatif
              </span>
              <span className="text-roseGold font-semibold">Superposition</span>
            </div>

            {/* Double Layer SVG Canvas — Dark Background */}
            <div className="p-4 rounded-2xl bg-obsidian border border-obsidian-border relative overflow-hidden flex flex-col items-center justify-center min-h-[220px]">
              
              <div className="w-full flex items-center justify-center gap-4 py-4 relative">
                
                {/* Left Eyebrow Double Overlay */}
                <div className="relative w-36 h-20">
                  {/* CALQUE 1: ORIGINAL BROW (Dotted Line) */}
                  <svg viewBox="0 0 160 80" className="absolute inset-0 w-full h-full text-gray-500 fill-none stroke-current">
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

                <div className="text-[10px] font-serif italic text-gray-400 border-x border-obsidian-border px-1 py-4">
                  Axe
                </div>

                {/* Right Eyebrow Double Overlay */}
                <div className="relative w-36 h-20">
                  {/* CALQUE 1: ORIGINAL BROW (Dotted Line) */}
                  <svg viewBox="0 0 160 80" className="absolute inset-0 w-full h-full text-gray-500 fill-none stroke-current">
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
              <div className="w-full pt-3 border-t border-obsidian-border/80 flex items-center justify-around text-[10px] font-serif italic text-gray-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-gray-500 border-t border-dashed" />
                  Originale Scannée
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-1 bg-roseGold rounded-full" />
                  Votre Retouche
                </span>
              </div>

            </div>

            <div className="p-3.5 rounded-2xl bg-obsidian border border-obsidian-border text-left space-y-1.5 text-xs text-white">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span className="font-medium">Modifications enregistrées pour la confection 3D</span>
              </div>
            </div>

            {/* Action button — Grand Bouton Or Rose Lumineux */}
            <button
              onClick={() => onNext(params)}
              className="w-full py-5 rounded-2xl bg-gradient-to-r from-roseGold-dark via-roseGold to-roseGold-metallic text-obsidian font-bold text-sm shadow-rose-glow hover:shadow-[0_0_50px_rgba(216,164,153,0.4)] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              <span className="tracking-wide">VISUALISER MON TAMPON SUR-MESURE</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onBack}
              className="text-xs text-gray-400 hover:text-white underline transition-colors block mx-auto pt-1 font-serif italic"
            >
              ← Revenir à l&apos;analyse
            </button>

          </div>
        </div>

      </div>
    </div>
  );
};
