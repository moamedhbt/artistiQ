'use client';

import React from 'react';
import { Sparkles, ShoppingBag, ArrowRight } from 'lucide-react';

interface BeautyCollectionGridProps {
  onOrderStamp: () => void;
}

export const BeautyCollectionGrid: React.FC<BeautyCollectionGridProps> = ({
  onOrderStamp,
}) => {
  const products = [
    {
      id: 'stamp',
      name: 'Tampon KristiQ Sur-Mesure',
      category: 'Sur-Mesure Individualisé',
      price: 'Individuel',
      description: 'Applicateur en silicone souple moulé selon votre empreinte morphologique.',
      action: 'COMMANDER',
      isPrimary: true,
    },
    {
      id: 'elixir',
      name: 'Élixir Fortifiant Sourcils',
      category: 'Soin Botanique',
      price: '2 800 DA',
      description: 'Sérum nourrissant aux huiles naturelles pour densifier les poils.',
      action: 'AJOUTER AU PANIER',
      isPrimary: false,
    },
    {
      id: 'pomade',
      name: 'Pommade Précision Haute Tenue',
      category: 'Maquillage Longue Durée',
      price: '3 200 DA',
      description: 'Pigments waterproof pour une tenue 24h avec le tampon.',
      action: 'AJOUTER AU PANIER',
      isPrimary: false,
    },
    {
      id: 'brush',
      name: 'Pinceau Sculptant Biseauté',
      category: 'Accessoire Beauté',
      price: '1 900 DA',
      description: 'Pinceau en fibres synthétiques ultra-fines pour estomper les contours.',
      action: 'AJOUTER AU PANIER',
      isPrimary: false,
    },
  ];

  return (
    <section id="produits" className="py-20 bg-pearl border-t border-pearl-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center space-y-3 mb-16">
          <span className="text-xs font-serif italic tracking-widest text-roseGold uppercase px-3.5 py-1 rounded-full bg-roseGold-light border border-roseGold/20">
            Produits & Rituels
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-charcoal tracking-wider uppercase">
            LA COLLECTION BEAUTÉ
          </h2>
          <p className="text-sm text-charcoal-muted font-serif italic max-w-xl mx-auto">
            Découvrez nos soins et produits de maquillage conçus pour accompagner votre tampon sur-mesure.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((prod) => (
            <div
              key={prod.id}
              className={`p-6 rounded-2xl border shadow-soft-luxury space-y-4 flex flex-col justify-between transition-all ${
                prod.isPrimary
                  ? 'bg-pearl-card border-roseGold shadow-pearlescent ring-1 ring-roseGold'
                  : 'bg-pearl-card border-pearl-border hover:border-roseGold/40'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-serif italic text-roseGold">
                  <span>{prod.category}</span>
                  {prod.isPrimary && <Sparkles className="w-4 h-4 text-roseGold" />}
                </div>

                <div className="p-6 rounded-xl bg-pearl border border-pearl-border text-center flex flex-col items-center justify-center min-h-[120px]">
                  <ShoppingBag className="w-8 h-8 text-roseGold/80 mb-2" />
                  <p className="font-serif font-bold text-sm text-charcoal">{prod.name}</p>
                  <p className="font-serif italic text-xs text-roseGold font-bold mt-1">{prod.price}</p>
                </div>

                <p className="text-xs text-charcoal-muted font-sans leading-relaxed">
                  {prod.description}
                </p>
              </div>

              <button
                onClick={onOrderStamp}
                className={`w-full py-3 rounded-xl font-serif tracking-widest text-xs uppercase font-bold transition-all flex items-center justify-center gap-2 ${
                  prod.isPrimary
                    ? 'bg-gradient-to-r from-purple-200 via-roseGold-light to-blue-200 text-charcoal shadow-pearlescent border border-white'
                    : 'bg-charcoal-button hover:bg-charcoal-buttonHover text-white shadow-button-shadow'
                }`}
              >
                <span>{prod.action}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
