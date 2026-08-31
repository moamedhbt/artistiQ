'use client';

import React from 'react';
import { Sparkles, ScanFace, Box, Shield, ArrowRight, CheckCircle2 } from 'lucide-react';

interface HeroProps {
  onStartScan: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartScan }) => {
  return (
    <section className="relative overflow-hidden py-16 lg:py-24">
      {/* Background Glow & Mesh Grid Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-gold/10 via-biometric-purple/5 to-transparent blur-3xl rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#1E1E2C_1px,transparent_1px)] [background-size:32px_32px] opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Hero Text Content */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-obsidian-card border border-gold/30 text-gold text-xs font-medium tracking-wide shadow-gold-glow">
              <Sparkles className="w-4 h-4 text-gold animate-spin-slow" />
              <span>Innovation Beauty-Tech 2026 • Scanner Biométrique IA</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-white leading-[1.15]">
              Le Sculptage de Sourcils <br />
              <span className="bg-gradient-to-r from-gold-light via-gold to-gold-dark bg-clip-text text-transparent">
                Sur-Mesure Absolu
              </span>
            </h1>

            <p className="text-lg text-gray-300 font-light leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Grâce à notre <strong className="text-white font-medium">Scanner Biométrique IA 3D</strong>, nous analysons les 468 points clés de votre visage pour concevoir votre <strong className="text-gold font-medium">pochoir en silicone médical sur-mesure</strong>. Tracé parfait et symétrie millimétrée garantis au quotidien.
            </p>

            {/* Feature Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 max-w-xl mx-auto lg:mx-0">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-obsidian-card/70 border border-obsidian-border text-left">
                <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center text-gold shrink-0">
                  <ScanFace className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Analyse 360°</p>
                  <p className="text-[11px] text-gray-400">Face & Profils</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-obsidian-card/70 border border-obsidian-border text-left">
                <div className="w-10 h-10 rounded-lg bg-biometric-cyan/10 flex items-center justify-center text-biometric-cyan shrink-0">
                  <Box className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Moule 3D</p>
                  <p className="text-[11px] text-gray-400">Silicone Souple</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-obsidian-card/70 border border-obsidian-border text-left">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Paiement Livraison</p>
                  <p className="text-[11px] text-gray-400">Sans carte requise</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                onClick={onStartScan}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-gold-light via-gold to-gold-dark text-obsidian font-bold text-base shadow-gold-glow hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
              >
                <span>Créer Mon Pochoir Sur-Mesure</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Guarantees List */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-gray-400 pt-2">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-gold" /> Sans Inscription
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-gold" /> Confidentialité Biométrique Tolale
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-gold" /> Précision 0.1 mm
              </span>
            </div>
          </div>

          {/* Right Interactive 3D Biometric Visual Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto w-full max-w-md aspect-[4/5] rounded-3xl bg-gradient-to-b from-obsidian-card to-obsidian border border-gold/30 shadow-card-glow overflow-hidden p-6 flex flex-col justify-between group">
              
              {/* Card Header HUD */}
              <div className="flex items-center justify-between text-xs text-gold border-b border-obsidian-border pb-4">
                <span className="font-mono flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  SCANNER BIOMÉTRIQUE V3.2
                </span>
                <span className="text-gray-400 font-mono">468 PTS MESH</span>
              </div>

              {/* Central Futuristic Face Simulation Graphics */}
              <div className="relative my-auto flex items-center justify-center h-64">
                {/* Rotating Biometric Target Ring */}
                <div className="absolute inset-0 rounded-full border border-gold/20 animate-spin-slow" />
                <div className="absolute inset-4 rounded-full border border-biometric-cyan/20 animate-reverse-spin" />

                {/* Laser Scanning Line */}
                <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-biometric-cyan to-transparent animate-laser-sweep z-20 shadow-cyan-glow" />

                {/* Eyebrow Highlight Curves */}
                <div className="relative z-10 w-4/5 text-center space-y-4">
                  <div className="p-4 rounded-2xl bg-obsidian-light/80 border border-gold/40 backdrop-blur-md shadow-gold-glow">
                    <p className="text-[11px] text-gold font-mono uppercase tracking-wider mb-2">
                      Analyse de l'Arcade & Symétrie
                    </p>
                    {/* SVG Eyebrow Contour Sample */}
                    <svg viewBox="0 0 200 60" className="w-full h-12 text-gold stroke-current fill-none">
                      <path
                        d="M 20 35 C 50 15, 80 15, 110 32 C 140 15, 170 15, 180 35"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                      <circle cx="20" cy="35" r="3" className="fill-biometric-cyan stroke-none" />
                      <circle cx="65" cy="18" r="4" className="fill-gold stroke-none animate-ping" />
                      <circle cx="110" cy="32" r="3" className="fill-biometric-cyan stroke-none" />
                      <circle cx="150" cy="18" r="4" className="fill-gold stroke-none animate-ping" />
                      <circle cx="180" cy="35" r="3" className="fill-biometric-cyan stroke-none" />
                    </svg>
                    <div className="flex justify-between text-[10px] text-gray-400 font-mono pt-2 border-t border-obsidian-border">
                      <span>Écart: 22.5 mm</span>
                      <span>Hauteur: 13.5 mm</span>
                      <span>Symétrie: 99.2%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer HUD Metrics */}
              <div className="p-3 rounded-xl bg-obsidian/90 border border-obsidian-border text-center">
                <p className="text-xs text-gray-300 font-serif">
                  "Moulage en silicone souple haute densité pour un maintien parfait sur le front."
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
