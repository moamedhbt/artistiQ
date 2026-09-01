'use client';

import React, { useState, useRef } from 'react';
import { Header } from '@/components/Header';
import { MainHeroSection } from '@/components/MainHeroSection';
import { ProductionCycle } from '@/components/ProductionCycle';
import { BeautyCollectionGrid } from '@/components/BeautyCollectionGrid';
import { StartupStory } from '@/components/StartupStory';
import { ClientInfoStep } from '@/components/ClientInfoStep';
import { BiometricScannerStep } from '@/components/BiometricScannerStep';
import { EyebrowStudioStep } from '@/components/EyebrowStudioStep';
import { ThreeDPreviewStep } from '@/components/ThreeDPreviewStep';
import { OrderConfirmationStep } from '@/components/OrderConfirmationStep';
import { AdminDashboard } from '@/components/AdminDashboard';
import { ClientInfo, BiometricMeasurements, EyebrowCustomParams, Order } from '@/types';
import { DEFAULT_BIOMETRICS, DEFAULT_CUSTOM_PARAMS } from '@/lib/biometrics';
import { saveNewOrder } from '@/lib/storage';
import { Lock } from 'lucide-react';

export default function Home() {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  
  const studioRef = useRef<HTMLDivElement>(null);
  const processRef = useRef<HTMLDivElement>(null);
  const productsRef = useRef<HTMLDivElement>(null);

  const [clientInfo, setClientInfo] = useState<ClientInfo>({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    notes: '',
  });

  const [biometrics, setBiometrics] = useState<BiometricMeasurements>(DEFAULT_BIOMETRICS);
  const [customParams, setCustomParams] = useState<EyebrowCustomParams>(DEFAULT_CUSTOM_PARAMS);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const scrollToSection = (sectionId: string) => {
    if (sectionId === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (sectionId === 'processus') {
      processRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else if (sectionId === 'produits') {
      productsRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else if (sectionId === 'commander') {
      setCurrentStep(1);
      setTimeout(() => {
        studioRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const handleClientInfoNext = (info: ClientInfo) => {
    setClientInfo(info);
    setCurrentStep(2);
    studioRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleBiometricsCompleted = (bio: BiometricMeasurements) => {
    setBiometrics(bio);
    setCustomParams({
      ...customParams,
      lengthMm: bio.leftEyebrowLengthMm,
      archHeightMm: bio.leftArchHeightMm,
      interGapMm: bio.interEyebrowGapMm,
    });
    setCurrentStep(3);
    studioRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleStudioNext = (params: EyebrowCustomParams) => {
    setCustomParams(params);
    setCurrentStep(4);
    studioRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleConfirmOrder = () => {
    const orderId = `ARTISTIQ-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const newOrder: Order = {
      id: orderId,
      createdAt: new Date().toISOString(),
      clientInfo,
      biometrics,
      customParams,
      status: 'pending_print',
    };

    saveNewOrder(newOrder);
    setCompletedOrder(newOrder);
    setCurrentStep(5);
    studioRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleReset = () => {
    setClientInfo({ fullName: '', phone: '', address: '', city: '', notes: '' });
    setBiometrics(DEFAULT_BIOMETRICS);
    setCustomParams(DEFAULT_CUSTOM_PARAMS);
    setCompletedOrder(null);
    setCurrentStep(0);
  };

  return (
    <div className="min-h-screen flex flex-col bg-pearl text-charcoal font-sans selection:bg-roseGold-light">
      
      {/* Header Navigation */}
      <Header onNavigate={scrollToSection} />

      {/* Main Sections */}
      <main className="flex-1">
        
        {/* Main Hero Banner: "PRÉCISION, PURITÉ ET LA FINITION PARFAITE." */}
        <MainHeroSection
          onOrderClick={() => scrollToSection('commander')}
          onExploreProcess={() => scrollToSection('processus')}
        />

        {/* Le Cycle de Production (Dispenser Nozzle, UV Tunnel, Laser Marker, Final Cube) */}
        <div ref={processRef}>
          <ProductionCycle />
        </div>

        {/* La Collection Beauté & Maquillage */}
        <div ref={productsRef}>
          <BeautyCollectionGrid onOrderStamp={() => scrollToSection('commander')} />
        </div>

        {/* Storytelling & Startup Vision */}
        <StartupStory />

        {/* Interactive Custom Stamp Order Studio */}
        <div ref={studioRef} id="commander" className="py-16 bg-gradient-to-b from-pearl-dark/30 via-pearl to-pearl border-t border-pearl-border">
          {currentStep === 1 && (
            <ClientInfoStep
              initialInfo={clientInfo}
              onNext={handleClientInfoNext}
            />
          )}

          {currentStep === 2 && (
            <BiometricScannerStep
              onCompleted={handleBiometricsCompleted}
              onBack={() => setCurrentStep(1)}
            />
          )}

          {currentStep === 3 && (
            <EyebrowStudioStep
              biometrics={biometrics}
              initialParams={customParams}
              onNext={handleStudioNext}
              onBack={() => setCurrentStep(2)}
            />
          )}

          {currentStep === 4 && (
            <ThreeDPreviewStep
              clientInfo={clientInfo}
              biometrics={biometrics}
              customParams={customParams}
              onConfirmOrder={handleConfirmOrder}
              onBack={() => setCurrentStep(3)}
            />
          )}

          {currentStep === 5 && completedOrder && (
            <OrderConfirmationStep
              order={completedOrder}
              onReset={handleReset}
            />
          )}
        </div>

      </main>

      {/* Secret Admin Modal */}
      {isAdminOpen && (
        <AdminDashboard onClose={() => setIsAdminOpen(false)} />
      )}

      {/* Footer */}
      <footer className="border-t border-pearl-border bg-pearl-dark/60 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-charcoal-muted font-serif italic">
          <div>
            <p className="font-bold text-charcoal font-sans text-sm not-italic mb-1">artistiQ Haute Beauté</p>
            <p>© 2026. Tous droits réservés. Replicated Brow Technology.</p>
          </div>
          
          <div className="flex items-center gap-6">
            <span>Paiement à la Livraison</span>
            <span>Tampon de Précision Sur-Mesure</span>
            <span>Verre Dépoli & Silicone Cosmétique</span>

            {/* Secret Admin Lock */}
            <button
              onClick={() => setIsAdminOpen(true)}
              className="p-1 text-gray-400 hover:text-roseGold transition-colors"
              title="Accès Privé Atelier"
            >
              <Lock className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
