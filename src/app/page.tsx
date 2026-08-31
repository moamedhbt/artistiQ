'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { ClientInfoStep } from '@/components/ClientInfoStep';
import { BiometricScannerStep } from '@/components/BiometricScannerStep';
import { EyebrowStudioStep } from '@/components/EyebrowStudioStep';
import { ThreeDPreviewStep } from '@/components/ThreeDPreviewStep';
import { OrderConfirmationStep } from '@/components/OrderConfirmationStep';
import { AdminDashboard } from '@/components/AdminDashboard';
import { ClientInfo, BiometricMeasurements, EyebrowCustomParams, Order } from '@/types';
import { DEFAULT_BIOMETRICS, DEFAULT_CUSTOM_PARAMS } from '@/lib/biometrics';
import { saveNewOrder } from '@/lib/storage';

export default function Home() {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);

  // User State
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

  // Step 1 Callback
  const handleClientInfoNext = (info: ClientInfo) => {
    setClientInfo(info);
    setCurrentStep(2);
  };

  // Step 2 Callback
  const handleBiometricsCompleted = (
    bio: BiometricMeasurements,
    snapshots?: { front?: string; left?: string; right?: string }
  ) => {
    setBiometrics(bio);
    setCustomParams({
      ...customParams,
      lengthMm: bio.leftEyebrowLengthMm,
      archHeightMm: bio.leftArchHeightMm,
      interGapMm: bio.interEyebrowGapMm,
    });
    setCurrentStep(3);
  };

  // Step 3 Callback
  const handleStudioNext = (params: EyebrowCustomParams) => {
    setCustomParams(params);
    setCurrentStep(4);
  };

  // Step 4 Callback (Order Creation)
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
  };

  // Reset to Start
  const handleReset = () => {
    setClientInfo({ fullName: '', phone: '', address: '', city: '', notes: '' });
    setBiometrics(DEFAULT_BIOMETRICS);
    setCustomParams(DEFAULT_CUSTOM_PARAMS);
    setCompletedOrder(null);
    setCurrentStep(0);
  };

  return (
    <div className="min-h-screen flex flex-col bg-obsidian text-gray-100">
      
      {/* Header / Navbar */}
      <Navbar
        currentStep={currentStep}
        totalSteps={5}
        onNavigateStep={(step) => setCurrentStep(step)}
        onToggleAdmin={() => setIsAdminOpen(!isAdminOpen)}
        isAdminOpen={isAdminOpen}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentStep === 0 && (
          <Hero onStartScan={() => setCurrentStep(1)} />
        )}

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
      </main>

      {/* Admin Panel Modal Overlay */}
      {isAdminOpen && (
        <AdminDashboard onClose={() => setIsAdminOpen(false)} />
      )}

      {/* Footer */}
      <footer className="border-t border-obsidian-border bg-obsidian-card/50 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400 font-mono">
          <p>© 2026 artistiQ. Tous droits réservés. Haute Technologie Biométrique.</p>
          <div className="flex items-center gap-6">
            <span>Paiement à la Livraison</span>
            <span>Impression 3D Sur-Mesure</span>
            <span>Silicone Pharmacie Biocompatible</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
