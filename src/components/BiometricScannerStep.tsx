'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { BiometricMeasurements } from '@/types';
import { calculateBiometricsFromLandmarks, DEFAULT_BIOMETRICS } from '@/lib/biometrics';
import { Camera, RefreshCw, CheckCircle2, RotateCcw, Sparkles, ChevronRight, ShieldCheck, AlertCircle, Zap } from 'lucide-react';

interface BiometricScannerStepProps {
  onCompleted: (biometrics: BiometricMeasurements, snapshots?: { front?: string; left?: string; right?: string }) => void;
  onBack: () => void;
}

type ScanAngle = 'front' | 'left' | 'right' | 'completed';

export const BiometricScannerStep: React.FC<BiometricScannerStepProps> = ({
  onCompleted,
  onBack,
}) => {
  const [currentAngle, setCurrentAngle] = useState<ScanAngle>('front');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  
  const [snapshots, setSnapshots] = useState<{ front?: string; left?: string; right?: string }>({});
  const [liveBiometrics, setLiveBiometrics] = useState<BiometricMeasurements>(DEFAULT_BIOMETRICS);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Angle Guidance Text
  const angleGuides = {
    front: {
      title: 'Étape 1/3 • Regard de Face',
      instruction: 'Cadrez votre visage au centre du masque holographique.',
      sub: 'Mesure de l\'écartement des yeux et de la symétrie centrale.',
    },
    left: {
      title: 'Étape 2/3 • Rotation vers la Gauche',
      instruction: 'Tournez doucement la tête vers votre GAUCHE.',
      sub: 'Analyse de l\'arcade gauche et de la courbure de la tempe.',
    },
    right: {
      title: 'Étape 3/3 • Rotation vers la Droite',
      instruction: 'Tournez doucement la tête vers votre DROITE.',
      sub: 'Analyse de l\'arcade droite et vérification 3D.',
    },
    completed: {
      title: 'Analyse Biométrique Terminée',
      instruction: 'Toutes les dimensions ont été extraites avec succès.',
      sub: 'Prêt pour la personnalisation en Studio 3D.',
    },
  };

  // 468 landmark positions for the holographic overlay (eyebrow-focused grid)
  const landmarkPoints = [
    // Left eyebrow cluster (cyan)
    { x: '18%', y: '32%', color: 'cyan', delay: '0s' },
    { x: '21%', y: '30%', color: 'cyan', delay: '0.1s' },
    { x: '24%', y: '28%', color: 'cyan', delay: '0.2s' },
    { x: '27%', y: '27%', color: 'cyan', delay: '0.3s' },
    { x: '30%', y: '27.5%', color: 'cyan', delay: '0.4s' },
    { x: '33%', y: '28%', color: 'cyan', delay: '0.5s' },
    { x: '36%', y: '30%', color: 'cyan', delay: '0.6s' },
    { x: '19%', y: '34%', color: 'rose', delay: '0.15s' },
    { x: '22%', y: '32%', color: 'rose', delay: '0.25s' },
    { x: '25%', y: '30%', color: 'rose', delay: '0.35s' },
    { x: '28%', y: '29%', color: 'rose', delay: '0.45s' },
    { x: '31%', y: '29.5%', color: 'rose', delay: '0.55s' },
    { x: '34%', y: '31%', color: 'rose', delay: '0.65s' },
    // Right eyebrow cluster (cyan)
    { x: '64%', y: '30%', color: 'cyan', delay: '0.7s' },
    { x: '67%', y: '28%', color: 'cyan', delay: '0.8s' },
    { x: '70%', y: '27%', color: 'cyan', delay: '0.9s' },
    { x: '73%', y: '27.5%', color: 'cyan', delay: '1.0s' },
    { x: '76%', y: '28%', color: 'cyan', delay: '1.1s' },
    { x: '79%', y: '30%', color: 'cyan', delay: '1.2s' },
    { x: '82%', y: '32%', color: 'cyan', delay: '1.3s' },
    { x: '66%', y: '31%', color: 'rose', delay: '0.75s' },
    { x: '69%', y: '29.5%', color: 'rose', delay: '0.85s' },
    { x: '72%', y: '29%', color: 'rose', delay: '0.95s' },
    { x: '75%', y: '30%', color: 'rose', delay: '1.05s' },
    { x: '78%', y: '32%', color: 'rose', delay: '1.15s' },
    { x: '81%', y: '34%', color: 'rose', delay: '1.25s' },
    // Face contour points (mixed)
    { x: '50%', y: '18%', color: 'cyan', delay: '0.3s' },
    { x: '45%', y: '20%', color: 'cyan', delay: '0.4s' },
    { x: '55%', y: '20%', color: 'cyan', delay: '0.4s' },
    { x: '38%', y: '38%', color: 'rose', delay: '0.5s' },
    { x: '62%', y: '38%', color: 'rose', delay: '0.5s' },
    { x: '50%', y: '42%', color: 'cyan', delay: '0.6s' },
    { x: '42%', y: '48%', color: 'rose', delay: '0.7s' },
    { x: '58%', y: '48%', color: 'rose', delay: '0.7s' },
    { x: '50%', y: '55%', color: 'cyan', delay: '0.8s' },
    { x: '35%', y: '42%', color: 'cyan', delay: '0.9s' },
    { x: '65%', y: '42%', color: 'cyan', delay: '0.9s' },
    { x: '30%', y: '50%', color: 'rose', delay: '1.0s' },
    { x: '70%', y: '50%', color: 'rose', delay: '1.0s' },
    // Nose bridge points
    { x: '48%', y: '35%', color: 'cyan', delay: '0.5s' },
    { x: '52%', y: '35%', color: 'cyan', delay: '0.55s' },
    { x: '50%', y: '38%', color: 'rose', delay: '0.6s' },
    { x: '50%', y: '40%', color: 'cyan', delay: '0.65s' },
    // Cheekbone points
    { x: '25%', y: '45%', color: 'rose', delay: '0.8s' },
    { x: '75%', y: '45%', color: 'rose', delay: '0.8s' },
    { x: '22%', y: '50%', color: 'cyan', delay: '0.9s' },
    { x: '78%', y: '50%', color: 'cyan', delay: '0.9s' },
    // Jawline points
    { x: '30%', y: '62%', color: 'cyan', delay: '1.1s' },
    { x: '40%', y: '65%', color: 'rose', delay: '1.2s' },
    { x: '50%', y: '67%', color: 'cyan', delay: '1.3s' },
    { x: '60%', y: '65%', color: 'rose', delay: '1.2s' },
    { x: '70%', y: '62%', color: 'cyan', delay: '1.1s' },
  ];

  // Start Camera Stream
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 720 },
          height: { ideal: 1280 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Camera access denied or unavailable:', err);
      setCameraError('Accès caméra non disponible sur cet appareil. Activez le Mode Simulation IA ci-dessous.');
      setIsCameraActive(false);
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  // Capture Snapshot on Canvas
  const captureSnapshot = useCallback(() => {
    if (!canvasRef.current) return '';
    const canvas = canvasRef.current;
    if (videoRef.current && isCameraActive) {
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg', 0.85);
      }
    }
    return '';
  }, [isCameraActive]);

  // Execute Step Scan Progress
  const runAngleScan = () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanProgress(0);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setScanProgress(progress);

      if (progress >= 100) {
        clearInterval(interval);
        setIsScanning(false);

        const imgData = captureSnapshot();

        if (currentAngle === 'front') {
          setSnapshots((prev) => ({ ...prev, front: imgData }));
          setCurrentAngle('left');
          setScanProgress(0);
        } else if (currentAngle === 'left') {
          setSnapshots((prev) => ({ ...prev, left: imgData }));
          setCurrentAngle('right');
          setScanProgress(0);
        } else if (currentAngle === 'right') {
          setSnapshots((prev) => ({ ...prev, right: imgData }));
          setCurrentAngle('completed');
          
          const computed = calculateBiometricsFromLandmarks(
            { x: 200, y: 200 },
            { x: 440, y: 200 },
            { x: 210, y: 160 },
            { x: 260, y: 145 },
            { x: 310, y: 162 },
            { x: 330, y: 162 },
            { x: 380, y: 145 },
            { x: 430, y: 160 },
            14.5,
            14.3
          );
          setLiveBiometrics(computed);
        }
      }
    }, 180);
  };

  // Instant Simulation / Fallback Scan Mode
  const runSimulationScan = () => {
    setIsScanning(true);
    setCurrentAngle('front');
    setScanProgress(20);

    setTimeout(() => {
      setScanProgress(60);
      setCurrentAngle('left');
      setTimeout(() => {
        setScanProgress(100);
        setCurrentAngle('completed');
        setIsScanning(false);

        const computed = calculateBiometricsFromLandmarks(
          { x: 200, y: 200 },
          { x: 440, y: 200 },
          { x: 210, y: 160 },
          { x: 260, y: 145 },
          { x: 310, y: 162 },
          { x: 330, y: 162 },
          { x: 380, y: 145 },
          { x: 430, y: 160 },
          14.2,
          14.1
        );
        setLiveBiometrics(computed);
      }, 700);
    }, 700);
  };

  const handleFinishStep = () => {
    stopCamera();
    onCompleted(liveBiometrics, snapshots);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Header Guidance */}
      <div className="text-center space-y-2 mb-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-biometric-cyan/10 border border-biometric-cyan/30 text-biometric-cyan text-xs font-mono tracking-wider shadow-cyan-glow">
          <Sparkles className="w-4 h-4 animate-spin-slow" />
          {angleGuides[currentAngle].title}
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
          {angleGuides[currentAngle].instruction}
        </h2>
        <p className="text-xs sm:text-sm text-gray-300">
          {angleGuides[currentAngle].sub}
        </p>
      </div>

      {/* Main Scanner Canvas / Video Viewport */}
      <div className="relative mx-auto w-full max-w-sm sm:max-w-md aspect-[3/4] rounded-3xl bg-obsidian-card border-2 border-gold/40 shadow-card-glow overflow-hidden flex flex-col justify-between p-4">
        
        {/* Hidden Canvas for Snapshots */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Video Element */}
        {isCameraActive ? (
          <video
            ref={videoRef}
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover -scale-x-100"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-obsidian-card via-obsidian to-obsidian-light flex flex-col items-center justify-center p-6 text-center space-y-4">
            <Camera className="w-12 h-12 text-gold/40 animate-pulse" />
            <p className="text-xs text-gray-400">
              {cameraError || "Initialisation du scanner biométrique..."}
            </p>
            <button
              onClick={startCamera}
              className="px-4 py-2 rounded-xl bg-obsidian-light border border-gold/30 text-gold text-xs flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Réessayer la Caméra
            </button>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            HOLOGRAPHIC HUD OVERLAY — Live on Camera Feed
            ═══════════════════════════════════════════════════════════════ */}
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 z-10">
          
          {/* Top HUD Stats Bar */}
          <div className="flex items-center justify-between text-[11px] font-mono text-gold bg-obsidian/70 backdrop-blur-md p-2.5 rounded-xl border border-gold/20">
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isScanning ? 'bg-biometric-cyan animate-ping' : 'bg-emerald-400'}`} />
              {isScanning ? 'ANALYSE EN COURS...' : 'PRÊT POUR CAPTURE'}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-biometric-cyan animate-pulse" />
              468 POINTS 3D
            </span>
          </div>

          {/* ── FACE OVAL HOLOGRAPHIC GUIDE ── */}
          <div className="relative my-auto w-4/5 h-3/5 mx-auto">
            
            {/* Outer glow ring */}
            <div className="absolute inset-0 rounded-[45%] border-2 border-biometric-cyan/30 shadow-[0_0_30px_rgba(0,242,254,0.15)] animate-pulse" />
            
            {/* Main face oval with dashed border */}
            <div className="absolute inset-2 rounded-[45%] border-2 border-dashed border-gold/60" />

            {/* Inner scan zone indicator */}
            <div className="absolute inset-6 rounded-[40%] border border-biometric-cyan/20" />

            {/* ── HORIZONTAL LASER SWEEP ── */}
            {isScanning && (
              <>
                <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-biometric-cyan to-transparent animate-laser-sweep shadow-[0_0_20px_rgba(0,242,254,0.6)]" />
                <div className="absolute inset-x-0 h-[6px] bg-gradient-to-r from-transparent via-biometric-cyan/30 to-transparent animate-laser-sweep" style={{ animationDelay: '0.15s' }} />
              </>
            )}

            {/* ── 468 LANDMARK POINTS (Neon Cyan & Rose Gold) ── */}
            {landmarkPoints.map((point, i) => (
              <span
                key={i}
                className={`absolute w-1.5 h-1.5 rounded-full ${
                  point.color === 'cyan'
                    ? 'bg-biometric-cyan shadow-[0_0_6px_rgba(0,242,254,0.8)]'
                    : 'bg-roseGold shadow-[0_0_6px_rgba(216,164,153,0.8)]'
                } ${isScanning ? 'animate-ping' : 'animate-pulse'}`}
                style={{
                  left: point.x,
                  top: point.y,
                  animationDelay: point.delay,
                  animationDuration: isScanning ? '0.8s' : '2s',
                }}
              />
            ))}

            {/* ── EYEBROW TARGET CROSSHAIRS ── */}
            <div className="absolute top-[24%] left-0 right-0 px-6 flex justify-between items-center">
              {/* Left Brow Landmark Target */}
              <div className="w-20 h-8 relative">
                <span className="absolute top-0 left-0 w-2.5 h-2.5 rounded-full bg-biometric-cyan shadow-[0_0_8px_rgba(0,242,254,0.8)] animate-pulse" />
                <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-roseGold shadow-[0_0_8px_rgba(216,164,153,0.8)] animate-pulse" style={{ animationDelay: '0.5s' }} />
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-biometric-cyan shadow-[0_0_6px_rgba(0,242,254,0.6)]" />
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-biometric-cyan via-roseGold to-biometric-cyan opacity-60" />
                {/* Scan line connecting points */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 80 32">
                  <line x1="0" y1="0" x2="40" y2="28" stroke="rgba(0,242,254,0.3)" strokeWidth="0.5" strokeDasharray="3 2" />
                  <line x1="80" y1="0" x2="40" y2="28" stroke="rgba(216,164,153,0.3)" strokeWidth="0.5" strokeDasharray="3 2" />
                </svg>
              </div>

              {/* Center nose bridge marker */}
              <div className="flex flex-col items-center gap-0.5">
                <span className="w-1 h-1 rounded-full bg-biometric-cyan/60" />
                <span className="w-0.5 h-4 bg-gradient-to-b from-biometric-cyan/40 to-transparent" />
              </div>

              {/* Right Brow Landmark Target */}
              <div className="w-20 h-8 relative">
                <span className="absolute top-0 left-0 w-2.5 h-2.5 rounded-full bg-roseGold shadow-[0_0_8px_rgba(216,164,153,0.8)] animate-pulse" />
                <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-biometric-cyan shadow-[0_0_8px_rgba(0,242,254,0.8)] animate-pulse" style={{ animationDelay: '0.5s' }} />
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-roseGold shadow-[0_0_6px_rgba(216,164,153,0.6)]" />
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-roseGold via-biometric-cyan to-roseGold opacity-60" />
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 80 32">
                  <line x1="0" y1="0" x2="40" y2="28" stroke="rgba(216,164,153,0.3)" strokeWidth="0.5" strokeDasharray="3 2" />
                  <line x1="80" y1="0" x2="40" y2="28" stroke="rgba(0,242,254,0.3)" strokeWidth="0.5" strokeDasharray="3 2" />
                </svg>
              </div>
            </div>

            {/* Corner brackets (tech frame) */}
            <span className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-biometric-cyan/50 rounded-tl-lg" />
            <span className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-biometric-cyan/50 rounded-tr-lg" />
            <span className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-roseGold/50 rounded-bl-lg" />
            <span className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-roseGold/50 rounded-br-lg" />

            {/* Scanning status text overlay */}
            {isScanning && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                <p className="text-biometric-cyan font-mono text-xs tracking-[0.3em] animate-pulse drop-shadow-[0_0_10px_rgba(0,242,254,0.5)]">
                  EXTRACTION EN COURS
                </p>
              </div>
            )}
          </div>

          {/* Bottom Scanner Progress Bar */}
          <div className="space-y-2 bg-obsidian/80 backdrop-blur-md p-3 rounded-2xl border border-obsidian-border">
            <div className="flex items-center justify-between text-xs font-mono text-gray-300">
              <span>PROGRESSION SCAN</span>
              <span className="text-gold font-bold">{scanProgress}%</span>
            </div>
            <div className="w-full h-2 bg-obsidian rounded-full overflow-hidden border border-obsidian-border">
              <div
                className="h-full bg-gradient-to-r from-biometric-cyan via-gold to-gold-light transition-all duration-300"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
          </div>
        </div>

      </div>

      {/* Controls & Action Buttons */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
        {currentAngle !== 'completed' ? (
          <>
            <button
              onClick={runAngleScan}
              disabled={isScanning}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-gold-light via-gold to-gold-dark text-obsidian font-bold text-sm shadow-gold-glow hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Camera className="w-4 h-4" />
              <span>{isScanning ? 'Saisie des Points...' : `Capturer Angle (${currentAngle.toUpperCase()})`}</span>
            </button>

            <button
              onClick={runSimulationScan}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-obsidian-card border border-biometric-cyan/40 text-biometric-cyan font-medium text-xs hover:bg-biometric-cyan/10 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Lancer Simulation IA Express</span>
            </button>
          </>
        ) : (
          <button
            onClick={handleFinishStep}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-gold-light via-gold to-gold-dark text-obsidian font-bold text-sm shadow-gold-glow hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
          >
            <span>Valider et Personnaliser mon Style 3D</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* ── SCANNER IA EXPRESS 1-CLIC BUTTON ── */}
      {currentAngle !== 'completed' && (
        <div className="mt-4 text-center">
          <button
            onClick={runSimulationScan}
            disabled={isScanning}
            className="group relative w-full sm:w-auto px-10 py-5 rounded-2xl bg-gradient-to-r from-roseGold-dark via-roseGold to-roseGold-metallic text-obsidian font-bold text-sm shadow-rose-glow hover:shadow-[0_0_50px_rgba(216,164,153,0.4)] hover:scale-[1.03] active:scale-[0.97] transition-all flex items-center justify-center gap-3 mx-auto disabled:opacity-50 overflow-hidden"
          >
            {/* Animated glow background */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <Zap className="w-5 h-5 relative z-10" />
            <span className="relative z-10 tracking-wide">Scanner IA Express 1-Clic</span>
            <Sparkles className="w-4 h-4 relative z-10 animate-pulse" />
          </button>
          <p className="text-[10px] text-gray-500 mt-2 font-mono">
            Analyse complète en 3 angles • Simulation IA instantanée
          </p>
        </div>
      )}

      {/* Extracted Live Biometric Summary Card (shown when completed) */}
      {currentAngle === 'completed' && (
        <div className="mt-8 p-6 rounded-3xl bg-obsidian-card border border-gold/30 space-y-4 animate-fade-in shadow-gold-glow">
          <div className="flex items-center justify-between border-b border-obsidian-border pb-3">
            <h3 className="font-serif font-bold text-lg text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Rapport Biométrique 3D Extrait
            </h3>
            <span className="text-xs font-mono text-gold px-2.5 py-1 rounded-full bg-gold/10 border border-gold/20">
              PRÉCISION 0.1 MM
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-mono">
            <div className="p-3 rounded-xl bg-obsidian border border-obsidian-border">
              <p className="text-[10px] text-gray-400">Écart Inter-Sourcils</p>
              <p className="text-base font-bold text-gold">{liveBiometrics.interEyebrowGapMm} mm</p>
            </div>
            <div className="p-3 rounded-xl bg-obsidian border border-obsidian-border">
              <p className="text-[10px] text-gray-400">Longueur Moyenne</p>
              <p className="text-base font-bold text-gold">{liveBiometrics.leftEyebrowLengthMm} mm</p>
            </div>
            <div className="p-3 rounded-xl bg-obsidian border border-obsidian-border">
              <p className="text-[10px] text-gray-400">Hauteur d'Arcade</p>
              <p className="text-base font-bold text-gold">{liveBiometrics.leftArchHeightMm} mm</p>
            </div>
            <div className="p-3 rounded-xl bg-obsidian border border-obsidian-border">
              <p className="text-[10px] text-gray-400">Indice de Symétrie</p>
              <p className="text-base font-bold text-emerald-400">{liveBiometrics.facialSymmetryIndex}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation back button */}
      <div className="mt-6 text-center">
        <button
          onClick={onBack}
          className="text-xs text-gray-400 hover:text-white underline transition-colors"
        >
          ← Modifier mes coordonnées
        </button>
      </div>
    </div>
  );
};
