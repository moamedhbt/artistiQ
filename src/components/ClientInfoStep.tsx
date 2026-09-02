'use client';

import React, { useState } from 'react';
import { ClientInfo } from '@/types';
import { User, Phone, MapPin, Building2, FileText, ArrowRight, ShieldCheck } from 'lucide-react';

interface ClientInfoStepProps {
  initialInfo: ClientInfo;
  onNext: (info: ClientInfo) => void;
}

export const ClientInfoStep: React.FC<ClientInfoStepProps> = ({
  initialInfo,
  onNext,
}) => {
  const [formData, setFormData] = useState<ClientInfo>(initialInfo);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.fullName.trim()) errs.fullName = 'Veuillez saisir votre nom et prénom.';
    if (!formData.phone.trim()) errs.phone = 'Veuillez saisir votre numéro de téléphone/WhatsApp.';
    if (!formData.address.trim()) errs.address = 'Veuillez indiquer votre adresse de livraison.';
    if (!formData.city.trim()) errs.city = 'Veuillez préciser votre ville.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onNext(formData);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center space-y-3 mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-roseGold/10 border border-roseGold/30 text-roseGold text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" />
          Étape 1 sur 4 • Sans Création de Compte
        </div>
        <h2 className="text-3xl font-serif font-bold text-white">
          Vos Coordonnées de Livraison
        </h2>
        <p className="text-sm text-gray-200 font-medium">
          Ces informations permettront la confection de votre fiche biométrique et l&apos;expédition directe de votre moule sur-mesure.
        </p>
      </div>

      {/* Form Card — Obsidian Dark Theme */}
      <form
        onSubmit={handleSubmit}
        className="bg-obsidian-card border border-obsidian-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-card-glow"
      >
        {/* Full Name */}
        <div>
          <label className="block text-sm font-semibold text-white mb-2">
            Nom & Prénom <span className="text-roseGold">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-roseGold/60" />
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Ex: Yasmine Mansouri"
              className="w-full pl-12 pr-4 py-4 bg-obsidian border border-obsidian-border rounded-xl text-white placeholder-gray-500 text-sm font-medium focus:outline-none focus:border-roseGold focus:ring-2 focus:ring-roseGold/30 transition-all"
            />
          </div>
          {errors.fullName && <p className="text-xs text-rose-400 mt-1.5 font-semibold">{errors.fullName}</p>}
        </div>

        {/* Phone / WhatsApp */}
        <div>
          <label className="block text-sm font-semibold text-white mb-2">
            Téléphone / WhatsApp <span className="text-roseGold">*</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-roseGold/60" />
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Ex: 0550 12 34 56"
              className="w-full pl-12 pr-4 py-4 bg-obsidian border border-obsidian-border rounded-xl text-white placeholder-gray-500 text-sm font-medium focus:outline-none focus:border-roseGold focus:ring-2 focus:ring-roseGold/30 transition-all"
            />
          </div>
          <p className="text-[11px] text-gray-300 mt-1.5 font-medium">
            Utilisé uniquement par notre coursier pour la confirmation avant livraison.
          </p>
          {errors.phone && <p className="text-xs text-rose-400 mt-1.5 font-semibold">{errors.phone}</p>}
        </div>

        {/* Address & City */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Ville <span className="text-roseGold">*</span>
            </label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-roseGold/60" />
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Ex: Alger"
                className="w-full pl-12 pr-4 py-4 bg-obsidian border border-obsidian-border rounded-xl text-white placeholder-gray-500 text-sm font-medium focus:outline-none focus:border-roseGold focus:ring-2 focus:ring-roseGold/30 transition-all"
              />
            </div>
            {errors.city && <p className="text-xs text-rose-400 mt-1.5 font-semibold">{errors.city}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Adresse Exacte <span className="text-roseGold">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-roseGold/60" />
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="N°, Rue, Quartier"
                className="w-full pl-12 pr-4 py-4 bg-obsidian border border-obsidian-border rounded-xl text-white placeholder-gray-500 text-sm font-medium focus:outline-none focus:border-roseGold focus:ring-2 focus:ring-roseGold/30 transition-all"
              />
            </div>
            {errors.address && <p className="text-xs text-rose-400 mt-1.5 font-semibold">{errors.address}</p>}
          </div>
        </div>

        {/* Special Notes */}
        <div>
          <label className="block text-sm font-semibold text-white mb-2">
            Remarques ou Préférences (Optionnel)
          </label>
          <div className="relative">
            <FileText className="absolute left-4 top-3.5 w-5 h-5 text-roseGold/60" />
            <textarea
              rows={3}
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Ex: Peau réactive / Préfère une flexibilité maximale..."
              className="w-full pl-12 pr-4 py-3.5 bg-obsidian border border-obsidian-border rounded-xl text-white placeholder-gray-500 text-sm font-medium focus:outline-none focus:border-roseGold focus:ring-2 focus:ring-roseGold/30 transition-all resize-none"
            />
          </div>
        </div>

        {/* Submit — Grand Bouton Or Rose Lumineux */}
        <div className="pt-4">
          <button
            type="submit"
            className="w-full py-5 rounded-2xl bg-gradient-to-r from-roseGold-dark via-roseGold to-roseGold-metallic text-obsidian font-bold text-base shadow-rose-glow hover:shadow-[0_0_50px_rgba(216,164,153,0.4)] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            <span>Passer à l&apos;Analyse IA par Caméra</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};
