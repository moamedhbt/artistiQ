'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "Comment le tampon garantit-il une symétrie parfaite ?",
      a: "Lors de la capture photo de votre visage, notre technologie analyse les 468 points clés de votre ossature (l'arcade, l'écartement des yeux et le temple). Le tampon est ensuite créé 100% sur-mesure pour votre visage uniquement.",
    },
    {
      q: "Quel type de maquillage utiliser avec le tampon ?",
      a: "Vous pouvez utiliser votre maquillage habituel : poudre à sourcils, crayon, gel teinté ou pommade. Appliquez simplement une touche de maquillage sur le tampon et pressez délicatement sur l'arcade.",
    },
    {
      q: "Comment entretenir et nettoyer le tampon ?",
      a: "Le tampon est fabriqué en silicone médical de qualité cosmétique. Il est lavable à l'eau tiède et au savon doux, et réutilisable indéfiniment sans déformation.",
    },
    {
      q: "Comment se déroule le paiement ?",
      a: "Le paiement s'effectue en espèces directement auprès du livreur à la réception de votre colis. Aucune carte bancaire n'est requise lors de la commande sur notre site.",
    },
  ];

  return (
    <section className="py-20 bg-pearl border-t border-pearl-border">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-serif italic tracking-widest text-roseGold uppercase px-3.5 py-1 rounded-full bg-roseGold-light border border-roseGold/20">
            Foire Aux Questions
          </span>
          <h2 className="text-3xl font-serif font-bold text-charcoal">
            Questions Fréquentes
          </h2>
          <p className="text-sm text-charcoal-muted font-serif italic">
            Tout ce que vous devez savoir sur la création et l'utilisation de votre tampon sur-mesure.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-pearl-card border border-pearl-border rounded-2xl overflow-hidden shadow-sm transition-all"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 font-serif font-bold text-sm text-charcoal hover:text-roseGold transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle className="w-4 h-4 text-roseGold shrink-0" />
                    {faq.q}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-roseGold transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-xs text-charcoal-muted font-sans leading-relaxed border-t border-pearl-border/50">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
