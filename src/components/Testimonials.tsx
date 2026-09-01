'use client';

import React from 'react';
import { Star, Heart, CheckCircle2 } from 'lucide-react';

export const Testimonials: React.FC = () => {
  const reviews = [
    {
      name: 'Yasmine Benali',
      city: 'Alger',
      rating: 5,
      comment: "Je gagne tellement de temps le matin ! Avant, je passais 15 minutes à essayer de rendre mes sourcils symétriques. Maintenant, en 5 secondes c'est fait et le tracé est parfait.",
      tag: 'Achat vérifié',
    },
    {
      name: 'Amel Mansouri',
      city: 'Oran',
      rating: 5,
      comment: "Le silicone est d'une douceur incroyable. Il épouse exactement l'os de mon arcade sans aucun espace vide. Je recommande à 1000% !",
      tag: 'Achat vérifié',
    },
    {
      name: 'Sarah Khelifi',
      city: 'Constantine',
      rating: 5,
      comment: "Service client fantastique. J'ai été livrée en 48h et j'ai payé à la livraison à la réception du colis. Le produit vaut largement son prix.",
      tag: 'Achat vérifié',
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-pearl-dark/40 to-pearl border-t border-pearl-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center space-y-3 mb-16">
          <span className="text-xs font-serif italic tracking-widest text-roseGold uppercase px-3.5 py-1 rounded-full bg-roseGold-light border border-roseGold/20">
            Témoignages • Elles ont adopté artistiQ
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-charcoal">
            La Confiance de Nos Clientes
          </h2>
          <p className="text-sm text-charcoal-muted font-serif italic max-w-xl mx-auto">
            Découvrez pourquoi les femmes qui ont essayé notre tampon sur-mesure ne peuvent plus s'en passer.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-pearl-card border border-pearl-border shadow-soft-luxury space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex text-roseGold">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current text-roseGold" />
                    ))}
                  </div>
                  <span className="text-[10px] text-emerald-600 font-serif italic flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> {rev.tag}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-charcoal leading-relaxed font-serif italic">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-4 border-t border-pearl-border flex items-center justify-between text-xs">
                <div>
                  <p className="font-serif font-bold text-charcoal">{rev.name}</p>
                  <p className="text-charcoal-muted text-[11px] font-serif italic">{rev.city}</p>
                </div>
                <Heart className="w-4 h-4 text-roseGold fill-roseGold-light" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
