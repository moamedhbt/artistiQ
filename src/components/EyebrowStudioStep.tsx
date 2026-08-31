'use client';

import React, { useState } from 'react';
import { EyebrowCustomParams, BiometricMeasurements, EyebrowStyleOption } from '@/types';
import { EYEBROW_STYLES, generateEyebrowSvgPath } from '@/lib/biometrics';
import { Sliders, Sparkles, Layers, ArrowRight, RotateCcw, Check, CheckCircle2 } from 'lucide-react';

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

  const handleStyleSelect = (style: EyebrowStyleOption) => {
    setParams({
      ...params,
      styleId: style.id,
      thicknessMm: style.baseThicknessMm,
      archHeightMm: style.baseArchHeightMm,
      lengthMm: style.baseLengthMm,
    });
  };

  const currentStyle = EYEBROW_STYLES.find((s) => s.id === params.styleId) || EYEBROW_STYLES[0];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="text-center space-y-2 mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-semibold">
          <Sparkles className="w-4 h-4" />
          Étape 3 sur 4 • Studio de Stylisme & Modélisation 3D
        </div>
        <h2 className="text-3xl font-serif font-bold text-white">
          Personnalisez la Forme de Vos Sourcils
        </h2>
        <p className="text-sm text-gray-300 max-w-xl mx-auto">
          Choisissez un style signature et ajustez les dimensions au millimètre près en fonction de vos préférences de maquillage.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Style Selection Cards & Sliders */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Style Selector Grid */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">
              1. Sélectionnez votre Style Signature
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {EYEBROW_STYLES.map((style) => {
                const isSelected = params.styleId === style.id;
                return (
                  <button
                    key={style.id}
                    onClick={() => handleStyleSelect(style)}
                    className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
                      isSelected
                        ? 'bg-obsidian-card border-gold shadow-gold-glow ring-1 ring-gold'
                        : 'bg-obsidian/70 border-obsidian-border hover:border-gold/40 hover:bg-obsidian-card'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-serif font-bold text-sm text-white">{style.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-gold/10 text-gold border border-gold/20">
                        {style.tag}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-gold/90 mb-1">{style.subtitle}</p>
                    <p className="text-[11px] text-gray-400 leading-snug line-clamp-2">{style.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Micro-Adjustment Sliders */}
          <div className="p-6 rounded-3xl bg-obsidian-card border border-obsidian-border space-y-5 shadow-card-glow">
            <div className="flex items-center justify-between border-b border-obsidian-border pb-3">
              <h3 className="font-serif font-bold text-sm text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-gold" />
                2. Réglage Fin des Dimensions (mm)
              </h3>
              <button
                onClick={() => handleStyleSelect(currentStyle)}
                className="text-[11px] text-gold hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Réinitialiser
              </button>
            </div>

            {/* Thickness Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-300">Épaisseur du Tracé</span>
                <span className="font-mono text-gold font-bold">{params.thicknessMm.toFixed(1)} mm</span>
              </div>
              <input
                type="range"
                min={4.0}
                max={10.0}
                step={0.1}
                value={params.thicknessMm}
                onChange={(e) => setParams({ ...params, thicknessMm: parseFloat(e.target.value) })}
                className="w-full accent-gold bg-obsidian rounded-lg h-2 cursor-pointer"
              />
            </div>

            {/* Arch Height Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-300">Hauteur d'Arcade (Courbure)</span>
                <span className="font-mono text-gold font-bold">{params.archHeightMm.toFixed(1)} mm</span>
              </div>
              <input
                type="range"
                min={8.0}
                max={22.0}
                step={0.1}
                value={params.archHeightMm}
                onChange={(e) => setParams({ ...params, archHeightMm: parseFloat(e.target.value) })}
                className="w-full accent-gold bg-obsidian rounded-lg h-2 cursor-pointer"
              />
            </div>

            {/* Length Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-300">Longueur Totale</span>
                <span className="font-mono text-gold font-bold">{params.lengthMm.toFixed(1)} mm</span>
              </div>
              <input
                type="range"
                min={40.0}
                max={65.0}
                step={0.1}
                value={params.lengthMm}
                onChange={(e) => setParams({ ...params, lengthMm: parseFloat(e.target.value) })}
                className="w-full accent-gold bg-obsidian rounded-lg h-2 cursor-pointer"
              />
            </div>

            {/* Inter-gap Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-300">Écartement Central (Entre les sourcils)</span>
                <span className="font-mono text-gold font-bold">{params.interGapMm.toFixed(1)} mm</span>
              </div>
              <input
                type="range"
                min={18.0}
                max={32.0}
                step={0.1}
                value={params.interGapMm}
                onChange={(e) => setParams({ ...params, interGapMm: parseFloat(e.target.value) })}
                className="w-full accent-gold bg-obsidian rounded-lg h-2 cursor-pointer"
              />
            </div>

            {/* Micro Grooves Density */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-300">Densité Micro-Fentes (Guidage Crayon/Poudre)</span>
                <span className="font-mono text-gold font-bold">Niveau {params.microGrooveDensity} / 5</span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                step={1}
                value={params.microGrooveDensity}
                onChange={(e) => setParams({ ...params, microGrooveDensity: parseInt(e.target.value) })}
                className="w-full accent-gold bg-obsidian rounded-lg h-2 cursor-pointer"
              />
            </div>

          </div>

        </div>

        {/* Right Column: Live Vector Preview Canvas */}
        <div className="lg:col-span-5 sticky top-24 space-y-6">
          <div className="p-6 rounded-3xl bg-gradient-to-b from-obsidian-card to-obsidian border border-gold/30 shadow-card-glow space-y-4 text-center">
            
            <div className="flex items-center justify-between text-xs text-gold border-b border-obsidian-border pb-3 font-mono">
              <span>RENDER VISUEL 2D</span>
              <span>ÉCHELLE 1:1</span>
            </div>

            {/* Visual SVG Stencil Rendering */}
            <div className="p-4 rounded-2xl bg-obsidian border border-obsidian-border relative overflow-hidden flex flex-col items-center justify-center min-h-[220px]">
              
              {/* Grid Lines */}
              <div className="absolute inset-0 bg-[radial-gradient(#252536_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

              <p className="text-[10px] font-mono text-gray-400 mb-2 uppercase tracking-widest">
                Aperçu du Tracé Gauche & Droit
              </p>

              {/* Eyebrows Vector Pair */}
              <div className="w-full flex items-center justify-center gap-4 py-4">
                {/* Left Eyebrow SVG */}
                <svg viewBox="0 0 160 80" className="w-36 h-20 text-gold fill-gold/20 stroke-gold filter drop-shadow-gold-glow">
                  <path
                    d={generateEyebrowSvgPath(params, 'left', 160, 80)}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                {/* Center Gap Indicator */}
                <div className="text-[10px] font-mono text-gold border-x border-gold/40 px-1 py-4">
                  {params.interGapMm} mm
                </div>

                {/* Right Eyebrow SVG */}
                <svg viewBox="0 0 160 80" className="w-36 h-20 text-gold fill-gold/20 stroke-gold filter drop-shadow-gold-glow">
                  <path
                    d={generateEyebrowSvgPath(params, 'right', 160, 80)}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <div className="text-[11px] text-gray-400 font-mono pt-2 border-t border-obsidian-border w-full flex justify-between">
                <span>Longueur: {params.lengthMm}mm</span>
                <span>Épaisseur: {params.thicknessMm}mm</span>
              </div>
            </div>

            {/* Summary Highlights */}
            <div className="p-4 rounded-2xl bg-obsidian-card border border-obsidian-border text-left space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Adapté à votre courbure de front ({biometrics.foreheadCurvatureRadiusMm}mm)</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Micro-fentes poil à poil intégrées au moule</span>
              </div>
            </div>

            {/* Next Step Button */}
            <button
              onClick={() => onNext(params)}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-gold-light via-gold to-gold-dark text-obsidian font-bold text-sm shadow-gold-glow hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span>Générer le Fichier & Aperçu 3D</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onBack}
              className="text-xs text-gray-400 hover:text-white underline transition-colors block mx-auto pt-1"
            >
              ← Revenir au scanner
            </button>

          </div>
        </div>

      </div>
    </div>
  );
};
