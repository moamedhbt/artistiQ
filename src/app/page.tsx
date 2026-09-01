'use client';

import React, { useState, useRef } from 'react';
import { Navbar } from '@/components/Navbar';
import { MainHeroSection } from '@/components/MainHeroSection';
import { TechnologyShowcase } from '@/components/TechnologyShowcase';
import { ProductHighlights } from '@/components/ProductHighlights';
import { BeforeAfterSlider } from '@/components/BeforeAfterSlider';
import { ClientInfoStep } from '@/components/ClientInfoStep';
import { BiometricScannerStep } from '@/components/BiometricScannerStep';
import { EyebrowStudioStep } from '@/components/EyebrowStudioStep';
import { ThreeDPreviewStep } from '@/components/ThreeDPreviewStep';
import { OrderConfirmationStep } from '@/components/OrderConfirmationStep';
import { StickyMobileBar } from '@/components/StickyMobileBar';
import { AdminDashboard } from '@/components/AdminDashboard';
import { Logo } from '@/components/Logo';
import { ClientInfo, BiometricMeasurements, EyebrowCustomParams, Order } from '@/types';
import { DEFAULT_BIOMETRICS, DEFAULT_CUSTOM_PARAMS } from '@/lib/biometrics';
import { saveNewOrder } from '@/lib/storage';
import { Lock } from 'lucide-react';

export default function Home() {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);

  const studioRef = useRef<HTMLDivElement>(null);

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

  const scrollToStudio = () => {
    setCurrentStep(1);
    setTimeout(() => {
      studioRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
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
      originalThicknessMm: 6.5,
      originalLengthMm: bio.leftEyebrowLengthMm,
      originalArchHeightMm: bio.leftArchHeightMm,
      originalInterGapMm: bio.interEyebrowGapMm,
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
    <div className="min-h-screen flex flex-col bg-pearl text-charcoal font-sans selection:bg-roseGold-light pb-16 md:pb-0">
      
      {/* Header Navigation */}
      <Navbar
        currentStep={currentStep}
        totalSteps={5}
        onNavigateStep={(step) => {
          setCurrentStep(step);
          if (step > 0) studioRef.current?.scrollIntoView({ behavior: 'smooth' });
        }}
        onStartScan={scrollToStudio}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        
        {/* Hero Section */}
        <MainHeroSection onStartScan={scrollToStudio} />

        {/* Technology Showcase (3 Scroll Steps) */}
        <TechnologyShowcase />

        {/* Product Highlights (Floating Cards) */}
        <ProductHighlights />

        {/* Vertical 3D Before/After Comparison */}
        <BeforeAfterSlider />

        {/* Experience Studio Anchor Section */}
        <div ref={studioRef} id="commander" className="py-16 bg-gradient-to-b from-pearl-dark/20 via-pearl to-pearl border-t border-pearl-border">
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

      {/* Sticky Mobile Bar for Smartphones */}
      <StickyMobileBar onOrderClick={scrollToStudio} />

      {/* Secret Private Admin Dashboard */}
      {isAdminOpen && (
        <AdminDashboard onClose={() => setIsAdminOpen(false)} />
      )}

      {/* Official Footer */}
      <footer className="border-t border-pearl-border bg-pearl-dark/60 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
          
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <Logo showSubtitle={true} className="origin-left scale-90" />
            <p className="text-xs text-charcoal-muted font-serif italic mt-2">
              © 2026 ARTISTIQ Haute Beauté. Tous droits réservés.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-charcoal-muted font-serif italic">
            <span>Paiement à la Livraison</span>
            <span>Tampon de Précision Sur-Mesure</span>
            <span>Silicone Médical Souple</span>

            {/* Discrete Secret Lock Icon for Owner */}
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
