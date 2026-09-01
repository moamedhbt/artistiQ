'use client';

import React, { useEffect } from 'react';
import { Order } from '@/types';
import confetti from 'canvas-confetti';
import { CheckCircle2, PackageCheck, PhoneCall, ShieldCheck, Sparkles, Home, ArrowRight } from 'lucide-react';

interface OrderConfirmationStepProps {
  order: Order;
  onReset: () => void;
}

export const OrderConfirmationStep: React.FC<OrderConfirmationStepProps> = ({
  order,
  onReset,
}) => {
  useEffect(() => {
    // Launch gold & white confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#D4AF37', '#F5E6AD', '#FFFFFF', '#00F2FE'],
    });
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center space-y-8 animate-fade-in">
      
      {/* Icon Badge */}
      <div className="relative inline-flex items-center justify-center">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-gold-dark via-gold to-gold-light p-1 shadow-gold-glow">
          <div className="w-full h-full bg-obsidian rounded-[22px] flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-gold animate-bounce" />
          </div>
        </div>
      </div>

      {/* Main Title */}
      <div className="space-y-3">
        <span className="text-xs font-mono tracking-widest text-gold uppercase px-4 py-1.5 rounded-full bg-gold/10 border border-gold/20">
          Commande Enregistrée avec Succès
        </span>
        <h2 className="text-4xl font-serif font-bold text-white">
          Merci, {order.clientInfo.fullName} !
        </h2>
        <p className="text-base text-gray-300 max-w-lg mx-auto font-light">
          Votre empreinte biométrique a été transmise à notre atelier. La confection de votre moule sur-mesure en silicone va débuter.
        </p>
      </div>

      {/* Order Details Card */}
      <div className="bg-obsidian-card border border-gold/30 rounded-3xl p-6 sm:p-8 space-y-6 text-left shadow-card-glow">
        <div className="flex items-center justify-between border-b border-obsidian-border pb-4">
          <div>
            <p className="text-[11px] text-gray-400 uppercase font-mono">Numéro de Commande</p>
            <p className="text-lg font-mono font-bold text-gold">{order.id}</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium flex items-center gap-1.5">
            <PackageCheck className="w-3.5 h-3.5" /> En cours de préparation
          </span>
        </div>

        {/* Client & Delivery Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-obsidian border border-obsidian-border space-y-1">
            <p className="text-gray-400 font-mono text-[10px] uppercase">Livraison</p>
            <p className="font-semibold text-white">{order.clientInfo.fullName}</p>
            <p className="text-gray-300">{order.clientInfo.address}</p>
            <p className="text-gray-300 font-semibold">{order.clientInfo.city}</p>
          </div>

          <div className="p-4 rounded-2xl bg-obsidian border border-obsidian-border space-y-1">
            <p className="text-gray-400 font-mono text-[10px] uppercase">Contact & Paiement</p>
            <p className="font-semibold text-white flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-gold" /> {order.clientInfo.phone}
            </p>
            <p className="text-emerald-400 font-semibold pt-1">
              Paiement à la livraison
            </p>
          </div>
        </div>

        {/* Workflow Timeline */}
        <div className="p-4 rounded-2xl bg-obsidian border border-obsidian-border space-y-3">
          <p className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
            Prochaines Étape :
          </p>
          <div className="space-y-2 text-xs text-gray-400">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-gold/10 text-gold flex items-center justify-center font-mono font-bold text-[11px] shrink-0">1</span>
              <span>Notre atelier génère le fichier 3D et lance l'impression du moule.</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-gold/10 text-gold flex items-center justify-center font-mono font-bold text-[11px] shrink-0">2</span>
              <span>Coulage du pochoir en silicone médical biocompatible et vérification de symétrie.</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-gold/10 text-gold flex items-center justify-center font-mono font-bold text-[11px] shrink-0">3</span>
              <span>Appel/WhatsApp de confirmation avant l'expédition à votre adresse.</span>
            </div>
          </div>
        </div>

      </div>

      {/* Home / New Order Button */}
      <div className="pt-4">
        <button
          onClick={onReset}
          className="px-8 py-4 rounded-2xl bg-obsidian-card border border-gold/40 text-gold font-bold text-sm hover:bg-gold/10 transition-all inline-flex items-center gap-2"
        >
          <Home className="w-4 h-4" />
          <span>Retourner à l'Accueil</span>
        </button>
      </div>

    </div>
  );
};
