'use client';

import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface StickyMobileBarProps {
  onOrderClick: () => void;
}

export const StickyMobileBar: React.FC<StickyMobileBarProps> = ({ onOrderClick }) => {
  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-pearl-card/90 backdrop-blur-xl border-t border-pearl-border p-3 shadow-luxury flex items-center justify-between gap-3 animate-fade-in">
      <div className="flex flex-col text-left pl-2">
        <span className="text-[10px] font-serif uppercase tracking-widest text-roseGold font-bold flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-roseGold" /> artistiQ
        </span>
        <span className="text-xs font-serif font-bold text-charcoal">
          Tampon Sur-Mesure
        </span>
      </div>

      <button
        onClick={onOrderClick}
        className="px-5 py-3 rounded-xl bg-charcoal-button hover:bg-charcoal-buttonHover text-white font-serif tracking-widest text-xs uppercase font-bold shadow-button-shadow border border-roseGold/30 flex items-center gap-2"
      >
        <span>Commander</span>
        <ArrowRight className="w-3.5 h-3.5 text-roseGold" />
      </button>
    </div>
  );
};
