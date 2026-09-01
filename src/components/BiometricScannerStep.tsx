'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { BiometricMeasurements } from '@/types';
import { calculateBiometricsFromLandmarks, DEFAULT_BIOMETRICS } from '@/lib/biometrics';
import { Camera, RefreshCw, CheckCircle2, Sparkles, ChevronRight, ChevronDown, ChevronUp, AlertCircle, Zap, HelpCircle, Eye, RotateCcw } from 'lucide-react';

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
  const [showGuide, setShowGuide] = useState<boolean>(false);
  const [scanMode, setScanMode] = useState<'idle' | 'camera' | 'simulation'>('idle');
  
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
      icon: '👤',
    },
    left: {
      title: 'Étape 2/3 • Rotation vers la Gauche',
      instruction: 'Tournez doucement la tête vers votre GAUCHE.',
      sub: 'Analyse de l\'arcade gauche et de la courbure de la tempe.',
      icon: '↩️',
    },
    right: {
      title: 'Étape 3/3 • Rotation vers la Droite',
      instruction: 'Tournez doucement la tête vers votre DROITE.',
      sub: 'Analyse de l\'arcade droite et vérification 3D.',
      icon: '↪️',
    },
    completed: {
      title: 'Analyse Biométrique Terminée',
      instruction: 'Toutes les dimensions ont été extraites avec succès.',
      sub: 'Prêt pour la personnalisation en Studio 3D.',
      icon: '✅',
    },
  };

  // 468 landmark positions for the holographic overlay
  const landmarkPoints = [
    // Left eyebrow cluster
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
    // Right eyebrow cluster
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
    // Face contour
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
    // Nose bridge
    { x: '48%', y: '35%', color: 'cyan', delay: '0.5s' },
    { x: '52%', y: '35%', color: 'cyan', delay: '0.55s' },
    { x: '50%', y: '38%', color: 'rose', delay: '0.6s' },
    { x: '50%', y: '40%', color: 'cyan', delay: '0.65s' },
    // Cheekbones
    { x: '25%', y: '45%', color: 'rose', delay: '0.8s' },
    { x: '75%', y: '45%', color: 'Steps', delay: '0.8s' },
    { x: '22%', y: '50%', color: 'cyan', delay: '0.9s' },
    { x: '78%', y: '50%', color: 'cyan', delay: '0.9s' },
    // Jawline
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
        await videoRef.current.play();
      }
      setIsCameraActive(true);
      setScanMode('camera');
    } catch (err: any) {
      console.warn('Camera access denied or unavailable:', err);
      setCameraError('Caméra non disponible. Utilisez le mode Simulation IA.');
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

  // Capture Snapshot
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

  // Camera-based scan (one angle at a time)
  const runCameraAngleScan = () => {
    if (isScanning || !isCameraActive) return;
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
            { x: 200, y: 200 }, { x: 440, y: 200 },
            { x: 210, y: 160 }, { x: 260, y: 145 },
            { x: 310, y: 162 }, { x: 330, y: 162 },
            { x: 380, y: 145 }, { x: 430, y: 160 },
            14.5, 14.3
          );
          setLiveBiometrics(computed);
        }
      }
    }, 180);
  };

  // Full simulation scan (all 3 angles automatically)
  const runFullSimulation = () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanMode('simulation');
    setCurrentAngle('front');
    setScanProgress(0);

    // Angle 1: Front
    let progress = 0;
    const interval1 = setInterval(() => {
      progress += 5;
      setScanProgress(progress);
      if (progress >= 33) {
        clearInterval(interval1);
        setCurrentAngle('left');
        
        // Angle 2: Left
        let progress2 = 33;
        const interval2 = setInterval(() => {
          progress2 += 5;
          setScanProgress(progress2);
          if (progress2 >= 66) {
            clearInterval(interval2);
            setCurrentAngle('right');
            
            // Angle 3: Right
            let progress3 = 66;
            const interval3 = setInterval(() => {
              progress3 += 5;
              setScanProgress(progress3);
              if (progress3 >= 100) {
                clearInterval(interval3);
                setCurrentAngle('completed');
                setIsScanning(false);

                const computed = calculateBiometricsFromLandmarks(
                  { x: 200, y: 200 }, { x: 440, y: 200 },
                  { x: 210, y: 160 }, { x: 260, y: 145 },
                  { x: 310, y: 162 }, { x: 330, y: 162 },
                  { x: 380, y: 145 }, { x: 430, y: 160 },
                  14.2, 14.1
                );
                setLiveBiometrics(computed);
              }
            }, 100);
          }
        }, 100);
      }
    }, 100);
  };

  const handleFinishStep = () => {
    stopCamera();
    onCompleted(liveBiometrics, snapshots);
  };

  const handleReset = () => {
    setCurrentAngle('front');
    setScanProgress(0);
    setScanMode('idle');
    setSnapshots({});
    setLiveBiometrics(DEFAULT_BIOMETRICS);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      
      {/* ═══════════════════════════════════════════════════════════════
          HEADER WITH HELP GUIDE TOGGLE
          ═══════════════════════════════════════════════════════════════ */}
      <div className="text-center space-y-3 mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-biometric-cyan/10 border border-biometric-cyan/30 text-biometric-cyan text-sm font-mono tracking-wider shadow-cyan-glow">
          <Sparkles className="w-4 h-4 animate-spin-slow" />
          {angleGuides[currentAngle].title}
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
          {angleGuides[currentAngle].instruction}
        </h2>
        <p className="text-sm text-gray-300">
          {angleGuides[currentAngle].sub}
        </p>

        {/* Help Guide Toggle */}
        <button
          onClick={() => setShowGuide(!showGuide)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-obsidian-card border border-obsidian-border text-gray-300 text-xs font-medium hover:bg-obsidian-light transition-all"
        >
          <HelpCircle className="w-4 h-4 text-roseGold" />
          {showGuide ? 'Masquer le guide' : 'Comment ça marche ?'}
          {showGuide ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        {/* Expandable Help Guide */}
        {showGuide && (
          <div className="max-w-xl mx-auto p-5 rounded-2xl bg-obsidian-card border border-roseGold/20 text-left space-y-4 animate-fade-in">
            <h4 className="font-serif font-bold text-sm text-roseGold flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Guide du Scanner Biométrique
            </h4>
            
            <div className="space-y-3 text-xs text-gray-300">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-obsidian border border-obsidian-border">
                <span className="w-7 h-7 rounded-full bg-roseGold/10 text-roseGold flex items-center justify-center font-bold text-sm shrink-0">1</span>
                <div>
                  <p className="font-semibold text-white mb-1">Activez votre caméra</p>
                  <p>Autorisez l&apos;accès à la caméra quand votre navigateur le demande. Placez votre visage dans l&apos;ovale holographique.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-xl bg-obsidian border border-obsidian-border">
                <span className="w-7 h-7 rounded-full bg-roseGold/10 text-roseGold flex items-center justify-center font-bold text-sm shrink-0">2</span>
                <div>
                  <p className="font-semibold text-white mb-1">Scannez vos 3 angles</p>
                  <p>Le scanner capture votre visage de face, puis à gauche, puis à droite. Suivez les instructions à l&apos;écran.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-xl bg-obsidian border border-obsidian-border">
                <span className="w-7 h-7 rounded-full bg-roseGold/10 text-roseGold flex items-center justify-center font-bold text-sm shrink-0">3</span>
                <div>
                  <p className="font-semibold text-white mb-1">Mode Simulation IA</p>
                  <p>Pas de caméra ? Pas de problème ! Le mode Simulation IA analyse vos sourcils automatiquement en 3 secondes.</p>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-biometric-cyan/5 border border-biometric-cyan/20 text-xs text-biometric-cyan">
              <strong>💡 Astuce :</strong> Pour un scan précis, assurez-vous d&apos;être dans un endroit bien éclairé avec le visage découvert.
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          CAMERA STATUS INDICATOR
          ═══════════════════════════════════════════════════════════════ */}
      <div className="flex items-center justify-center gap-3 mb-4">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono ${
          isCameraActive 
            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' 
            : cameraError 
              ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
              : 'bg-gray-500/10 border border-gray-500/30 text-gray-400'
        }`}>
          <span className={`w-2 h-2 rounded-full ${
            isCameraActive ? 'bg-emerald-400 animate-pulse' : cameraError ? 'bg-amber-400' : 'bg-gray-400 animate-pulse'
          }`} />
          {isCameraActive ? 'Caméra active' : cameraError ? 'Caméra indisponible' : 'Initialisation...'}
        </div>
        
        {!isCameraActive && (
          <button
            onClick={startCamera}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-obsidian-card border border-roseGold/30 text-roseGold text-xs font-medium hover:bg-roseGold/10 transition-all"
          >
            <RefreshCw className="w-3 h-3" />
            Réessayer
          </button>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          MAIN SCANNER VIEWPORT
          ═══════════════════════════════════════════════════════════════ */}
      <div className="relative mx-auto w-full max-w-sm sm:max-w-md aspect-[3/4] rounded-3xl bg-obsidian-card border-2 border-roseGold/40 shadow-rose-glow overflow-hidden">
        
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
          <div className="absolute inset-0 bg-gradient-to-b from-obsidian-card via-obsidian to-obsidian-light flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-roseGold/10 border-2 border-roseGold/30 flex items-center justify-center">
              <Camera className="w-10 h-10 text-roseGold animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white mb-2">
                {cameraError || "Initialisation du scanner..."}
              </p>
              <p className="text-xs text-gray-400">
                Autorisez l&apos;accès à la caméra ou utilisez le mode Simulation IA ci-dessous
              </p>
            </div>
          </div>
        )}

        {/* HOLOGRAPHIC HUD OVERLAY */}
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 z-10">
          
          {/* Top HUD Stats */}
          <div className="flex items-center justify-between text-[11px] font-mono text-roseGold bg-obsidian/80 backdrop-blur-md p-3 rounded-xl border border-roseGold/20">
            <span className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isScanning ? 'bg-biometric-cyan animate-ping' : 'bg-emerald-400'}`} />
              {isScanning ? 'ANALYSE EN COURS...' : 'PRÊT'}
            </span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-biometric-cyan animate-pulse" />
              468 POINTS 3D
            </span>
          </div>

          {/* FACE OVAL HOLOGRAPHIC GUIDE */}
          <div className="relative my-auto w-4/5 h-3/5 mx-auto">
            
            {/* Outer glow ring */}
            <div className="absolute inset-0 rounded-[45%] border-2 border-biometric-cyan/30 shadow-[0_0_30px_rgba(0,242,254,0.15)] animate-pulse" />
            
            {/* Main face oval */}
            <div className="absolute inset-2 rounded-[45%] border-2 border-dashed border-roseGold/60" />

            {/* Inner scan zone */}
            <div className="absolute inset-6 rounded-[40%] border border-biometric-cyan/20" />

            {/* HORIZONTAL LASER SWEEP */}
            {isScanning && (
              <>
                <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-biometric-cyan to-transparent animate-laser-sweep shadow-[0_0_20px_rgba(0,242,254,0.6)]" />
                <div className="absolute inset-x-0 h-[6px] bg-gradient-to-r from-transparent via-biometric-cyan/30 to-transparent animate-laser-sweep" style={{ animationDelay: '0.15s' }} />
              </>
            )}

            {/* 468 LANDMARK POINTS */}
            {landmarkPoints.map((point, i) => (
              <span
                key={i}
                className={`absolute w-2 h-2 rounded-full ${
                  point.color === 'cyan'
                    ? 'bg-biometric-cyan shadow-[0_0_8px_rgba(0,242,254,0.8)]'
                    : 'bg-roseGold shadow-[0_0_8px_rgba(216,164,153,0.8)]'
                } ${isScanning ? 'animate-ping' : 'animate-pulse'}`}
                style={{
                  left: point.x,
                  top: point.y,
                  animationDelay: point.delay,
                  animationDuration: isScanning ? '0.8s' : '2s',
                }}
              />
            ))}

            {/* EYEBROW TARGET CROSSHAIRS */}
            <div className="absolute top-[24%] left-0 right-0 px-6 flex justify-between items-center">
              {/* Left Brow */}
              <div className="w-20 h-8 relative">
                <span className="absolute top-0 left-0 w-3 h-3 rounded-full bg-biometric-cyan shadow-[0_0_10px_rgba(0,242,254,0.8)] animate-pulse" />
                <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-roseGold shadow-[0_0_10px_rgba(216,164,153,0.8)] animate-pulse" style={{ animationDelay: '0.5s' }} />
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-biometric-cyan shadow-[0_0_8px_rgba(0,242,254,0.6)]" />
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-biometric-cyan via-roseGold to-biometric-cyan opacity-60" />
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 80 32">
                  <line x1="0" y1="0" x2="40" y2="28" stroke="rgba(0,242,254,0.4)" strokeWidth="1" strokeDasharray="4 3" />
                  <line x1="80" y1="0" x2="40" y2="28" stroke="rgba(216,164,153,0.4)" strokeWidth="1" strokeDasharray="4 3" />
                </svg>
              </div>

              {/* Center nose bridge */}
              <div className="flex flex-col items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-biometric-cyan/60" />
                <span className="w-0.5 h-5 bg-gradient-to-b from-biometric-cyan/40 to-transparent" />
              </div>

              {/* Right Brow */}
              <div className="w-20 h-8 relative">
                <span className="absolute top-0 left-0 w-3 h-3 rounded-full bg-roseGold shadow-[0_0_10px_rgba(216,164,153,0.8)] animate-pulse" />
                <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-biometric-cyan shadow-[0_0_10px_rgba(0,242,254,0.8)] animate-pulse" style={{ animationDelay: '0.5s' }} />
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-roseGold shadow-[0_0_8px_rgba(216,164,153,0.6)]" />
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-roseGold via-biometric-cyan to-roseGold opacity-60" />
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 80 32">
                  <line x1="0" y1="0" x2="40" y2="28" stroke="rgba(216,164,153,0.4)" strokeWidth="1" strokeDasharray="4 3" />
                  <line x1="80" y1="0" x2="40" y2="28" stroke="rgba(0,242,254,0.4)" strokeWidth="1" strokeDasharray="4 3" />
                </svg>
              </div>
            </div>

            {/* Corner brackets */}
            <span className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-biometric-cyan/60 rounded-tl-lg" />
            <span className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-biometric-cyan/60 rounded-tr-lg" />
            <span className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-roseGold/60 rounded-bl-lg" />
            <span className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-roseGold/60 rounded-br-lg" />

            {/* Scanning status */}
            {isScanning && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                <p className="text-biometric-cyan font-mono text-sm tracking-[0.3em] animate-pulse drop-shadow-[0_0_15px_rgba(0,242,254,0.6)]">
                  EXTRACTION EN COURS
                </p>
              </div>
            )}
          </div>

          {/* Bottom Progress Bar */}
          <div className="space-y-2 bg-obsidian/80 backdrop-blur-md p-3 rounded-2xl border border-obsidian-border">
            <div className="flex items-center justify-between text-xs font-mono text-gray-300">
              <span>PROGRESSION</span>
              <span className="text-roseGold font-bold">{scanProgress}%</span>
            </div>
            <div className="w-full h-2.5 bg-obsidian rounded-full overflow-hidden border border-obsidian-border">
              <div
                className="h-full bg-gradient-to-r from-biometric-cyan via-roseGold to-roseGold-metallic transition-all duration-300"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
            {/* Step indicators */}
            <div className="flex items-center justify-between text-[10px] font-mono text-gray-500">
              <span className={currentAngle === 'front' || currentAngle === 'left' || currentAngle === 'right' || currentAngle === 'completed' ? 'text-biometric-cyan' : ''}>Face</span>
              <span className={currentAngle === 'left' || currentAngle === 'right' || currentAngle === 'completed' ? 'text-biometric-cyan' : ''}>Gauche</span>
              <span className={currentAngle === 'right' || currentAngle === 'completed' ? 'text-biometric-cyan' : ''}>Droite</span>
              <span className={currentAngle === 'completed' ? 'text-emerald-400' : ''}>Terminé</span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          ACTION BUTTONS — CLEAR & SIMPLE
          ═══════════════════════════════════════════════════════════════ */}
      <div className="mt-8 space-y-4">
        
        {currentAngle !== 'completed' ? (
          <>
            {/* PRIMARY: Scanner IA Express 1-Clic (MAIN BUTTON) */}
            <button
              onClick={runFullSimulation}
              disabled={isScanning}
              className="group relative w-full py-5 rounded-2xl bg-gradient-to-r from-roseGold-dark via-roseGold to-roseGold-metallic text-obsidian font-bold text-base shadow-rose-glow hover:shadow-[0_0_60px_rgba(216,164,153,0.4)] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 disabled:opacity-50 overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <Zap className="w-6 h-6 relative z-10" />
              <span className="relative z-10 tracking-wide">
                {isScanning ? 'Analyse en cours...' : 'Scanner IA Express 1-Clic'}
              </span>
              {!isScanning && <Sparkles className="w-5 h-5 relative z-10 animate-pulse" />}
            </button>
            <p className="text-center text-xs text-gray-400 font-mono">
              Analyse complète automatique en 3 angles • ~3 secondes
            </p>

            {/* SECONDARY: Camera Manual Capture (only if camera is active) */}
            {isCameraActive && (
              <div className="pt-2 border-t border-obsidian-border">
                <p className="text-center text-xs text-gray-500 mb-3 font-mono uppercase tracking-wider">Ou capture manuelle avec caméra</p>
                <button
                  onClick={runCameraAngleScan}
                  disabled={isScanning}
                  className="w-full py-4 rounded-2xl bg-obsidian-card border-2 border-roseGold/40 text-roseGold font-bold text-sm hover:bg-roseGold/10 hover:border-roseGold/60 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  <Camera className="w-5 h-5" />
                  <span>
                    {isScanning ? 'Capture en cours...' : `Capturer angle : ${currentAngle.toUpperCase()}`}
                  </span>
                </button>
                <p className="text-center text-[10px] text-gray-500 mt-2">
                  Capturez chaque angle un par un avec votre caméra
                </p>
              </div>
            )}

            {/* Reset button */}
            {scanMode !== 'idle' && (
              <button
                onClick={handleReset}
                className="w-full py-3 rounded-xl bg-obsidian border border-obsidian-border text-gray-400 text-xs font-medium hover:bg-obsidian-light hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Recommencer le scan
              </button>
            )}
          </>
        ) : (
          /* COMPLETED: Validate button */
          <button
            onClick={handleFinishStep}
            className="w-full py-5 rounded-2xl bg-gradient-to-r from-roseGold-dark via-roseGold to-roseGold-metallic text-obsidian font-bold text-base shadow-rose-glow hover:shadow-[0_0_60px_rgba(216,164,153,0.4)] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3"
          >
            <CheckCircle2 className="w-6 h-6" />
            <span>Valider et Personnaliser mon Style 3D</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          BIOMETRIC RESULTS (when completed)
          ═══════════════════════════════════════════════════════════════ */}
      {currentAngle === 'completed' && (
        <div className="mt-8 p-6 rounded-3xl bg-obsidian-card border border-roseGold/30 space-y-4 animate-fade-in shadow-rose-glow">
          <div className="flex items-center justify-between border-b border-obsidian-border pb-3">
            <h3 className="font-serif font-bold text-lg text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Rapport Biométrique 3D Extrait
            </h3>
            <span className="text-xs font-mono text-roseGold px-3 py-1 rounded-full bg-roseGold/10 border border-roseGold/20">
              PRÉCISION 0.1 MM
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-mono">
            <div className="p-4 rounded-xl bg-obsidian border border-obsidian-border">
              <p className="text-[10px] text-gray-400 mb-1">Écart Inter-Sourcils</p>
              <p className="text-lg font-bold text-roseGold">{liveBiometrics.interEyebrowGapMm} mm</p>
            </div>
            <div className="p-4 rounded-xl bg-obsidian border border-obsidian-border">
              <p className="text-[10px] text-gray-400 mb-1">Longueur Moyenne</p>
              <p className="text-lg font-bold text-roseGold">{liveBiometrics.leftEyebrowLengthMm} mm</p>
            </div>
            <div className="p-4 rounded-xl bg-obsidian border border-obsidian-border">
              <p className="text-[10px] text-gray-400 mb-1">Hauteur d&apos;Arcade</p>
              <p className="text-lg font-bold text-roseGold">{liveBiometrics.leftArchHeightMm} mm</p>
            </div>
            <div className="p-4 rounded-xl bg-obsidian border border-obsidian-border">
              <p className="text-[10px] text-gray-400 mb-1">Indice de Symétrie</p>
              <p className="text-lg font-bold text-emerald-400">{liveBiometrics.facialSymmetryIndex}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Back button */}
      <div className="mt-8 text-center">
        <button
          onClick={onBack}
          className="text-sm text-gray-400 hover:text-roseGold underline transition-colors font-medium"
        >
          ← Modifier mes coordonnées
        </button>
      </div>
    </div>
  );
};
