'use client';

import React from 'react';
import { ShieldCheck, HeartHandshake, PackageCheck } from 'lucide-react';

export const TrustBadges: React.FC = () => {
  return (
    <section className="py-16 bg-pearl border-t border-pearl-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          
          {/* Badge 1 */}
          <div className="p-6 rounded-3xl bg-pearl-card border border-pearl-border shadow-soft-luxury space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-roseGold-light border border-roseGold/20 flex items-center justify-center text-roseGold mx-auto shadow-rose-glow">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-base text-charcoal">
              Silicone Cosmétique Bio-Adaptatif
            </h3>
            <p className="text-xs text-charcoal-muted font-sans leading-relaxed">
              Matière extra-douce, hypoallergénique et lavable. Conçue pour une réutilisation quotidienne indéfinie.
            </p>
          </div>

          {/* Badge 2 */}
          <div className="p-6 rounded-3xl bg-pearl-card border border-pearl-border shadow-soft-luxury space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-roseGold-light border border-roseGold/20 flex items-center justify-center text-roseGold mx-auto shadow-rose-glow">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-base text-charcoal">
              Empreinte Sur-Mesure Individuelle
            </h3>
            <p className="text-xs text-charcoal-muted font-sans leading-relaxed">
              Modelé d'après la ligne naturelle de votre visage pour épouser l'os de votre arcade avec une précision millimétrée.
            </p>
          </div>

          {/* Badge 3 */}
          <div className="p-6 rounded-3xl bg-pearl-card border border-pearl-border shadow-soft-luxury space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-roseGold-light border border-roseGold/20 flex items-center justify-center text-roseGold mx-auto shadow-rose-glow">
              <PackageCheck className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-base text-charcoal">
              Paiement Sécurisé à la Livraison
            </h3>
            <p className="text-xs text-charcoal-muted font-sans leading-relaxed">
              Commandez sans carte bancaire. Vous vérifiez votre colis et réglez directement en espèces auprès du livreur.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};
