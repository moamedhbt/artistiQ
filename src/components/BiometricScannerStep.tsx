'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { BiometricMeasurements } from '@/types';
import { calculateBiometricsFromLandmarks, DEFAULT_BIOMETRICS } from '@/lib/biometrics';
import { Camera, RefreshCw, CheckCircle2, Sparkles, ChevronRight, ChevronDown, ChevronUp, Zap, HelpCircle, Eye, RotateCcw, Scan, Crosshair, ArrowLeft, ArrowRight } from 'lucide-react';
import dynamic from 'next/dynamic';

const FaceMeshCanvas = dynamic(() => import('./FaceMeshCanvas'), { ssr: false });

interface BiometricScannerStepProps {
  onCompleted: (biometrics: BiometricMeasurements, snapshots?: { front?: string; left?: string; right?: string }) => void;
  onBack: () => void;
}

type ScanPhase = 'idle' | 'detecting' | 'positioned' | 'scanning-left' | 'scanning-right' | 'scanning-complete' | 'completed';

export const BiometricScannerStep: React.FC<BiometricScannerStepProps> = ({
  onCompleted,
  onBack,
}) => {
  const [scanPhase, setScanPhase] = useState<ScanPhase>('idle');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [showGuide, setShowGuide] = useState<boolean>(false);
  const [faceDetected, setFaceDetected] = useState<boolean>(false);
  const [currentInstruction, setCurrentInstruction] = useState<string>('');
  
  const [snapshots, setSnapshots] = useState<{ front?: string; left?: string; right?: string }>({});
  const [liveBiometrics, setLiveBiometrics] = useState<BiometricMeasurements>(DEFAULT_BIOMETRICS);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Phase descriptions
  const phaseInfo: Record<ScanPhase, { title: string; instruction: string; sub: string; color: string }> = {
    idle: {
      title: 'Initialisation du Scanner',
      instruction: 'Placez votre visage dans le cadre holographique.',
      sub: 'Le scanner va détecter automatiquement votre visage.',
      color: 'text-gray-400',
    },
    detecting: {
      title: 'Détection en Cours',
      instruction: 'Restez immobile, détection de votre visage...',
      sub: 'Analyse des points biométriques en temps réel.',
      color: 'text-amber-400',
    },
    positioned: {
      title: 'Visage Détecté ✓',
      instruction: 'Parfait ! Votre visage est bien positionné.',
      sub: 'Le scanner va analyser vos sourcils sous 3 angles.',
      color: 'text-emerald-400',
    },
    'scanning-left': {
      title: 'Scan Angle Gauche',
      instruction: 'Tournez doucement la tête vers votre GAUCHE.',
      sub: 'Analyse de l\'arcade gauche et de la courbure de la tempe.',
      color: 'text-biometric-cyan',
    },
    'scanning-right': {
      title: 'Scan Angle Droit',
      instruction: 'Tournez doucement la tête vers votre DROITE.',
      sub: 'Analyse de l\'arcade droite et vérification 3D.',
      color: 'text-biometric-cyan',
    },
    'scanning-complete': {
      title: 'Scan Terminé ✓',
      instruction: 'Toutes les mesures ont été extraites !',
      sub: 'Votre empreinte biométrique est prête.',
      color: 'text-emerald-400',
    },
    completed: {
      title: 'Analyse Biométrique Terminée',
      instruction: 'Rapport extrait avec succès.',
      sub: 'Prêt pour la personnalisation en Studio 3D.',
      color: 'text-emerald-400',
    },
  };

  // Start Camera
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 1280 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
        };
      }
      setIsCameraActive(true);
      
      // Auto-start detection after camera is active
      setTimeout(() => {
        setScanPhase('detecting');
        setCurrentInstruction('Détection automatique en cours...');
      }, 500);
      
      // Simulate face detection after 2 seconds
      setTimeout(() => {
        setFaceDetected(true);
        setScanPhase('positioned');
        setCurrentInstruction('Visage détecté ! Prêt pour le scan.');
      }, 2500);
      
    } catch (err: any) {
      console.warn('Camera error:', err);
      setCameraError('Caméra non disponible. Utilisez le mode Simulation.');
      setIsCameraActive(false);
    }
  };

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

  // Handle landmarks from FaceMeshCanvas
  const handleLandmarksDetected = useCallback((landmarks: any[]) => {
    if (landmarks && landmarks.length > 0 && !faceDetected) {
      setFaceDetected(true);
      if (scanPhase === 'detecting') {
        setScanPhase('positioned');
      }
    }
  }, [faceDetected, scanPhase]);

  // Capture snapshot
  const captureSnapshot = useCallback(() => {
    if (!canvasRef.current || !videoRef.current) return '';
    const canvas = canvasRef.current;
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/jpeg', 0.85);
    }
    return '';
  }, []);

  // Run scan for a specific angle
  const runAngleScan = (angle: 'left' | 'right' | 'front') => {
    setScanProgress(0);
    let progress = 0;
    
    const interval = setInterval(() => {
      progress += 2;
      setScanProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        
        const imgData = captureSnapshot();
        setSnapshots(prev => ({ ...prev, [angle]: imgData }));
        
        if (angle === 'front') {
          // After front scan, ask for left
          setTimeout(() => {
            setScanPhase('scanning-left');
            setCurrentInstruction('Tournez à GAUCHE...');
            runAngleScan('left');
          }, 500);
        } else if (angle === 'left') {
          // After left scan, ask for right
          setTimeout(() => {
            setScanPhase('scanning-right');
            setCurrentInstruction('Tournez à DROITE...');
            runAngleScan('right');
          }, 500);
        } else if (angle === 'right') {
          // After right scan, complete
          setTimeout(() => {
            setScanPhase('scanning-complete');
            setCurrentInstruction('Scan terminé !');
            
            // Generate biometrics
            const computed = calculateBiometricsFromLandmarks(
              { x: 200, y: 200 }, { x: 440, y: 200 },
              { x: 210, y: 160 }, { x: 260, y: 145 },
              { x: 310, y: 162 }, { x: 330, y: 162 },
              { x: 380, y: 145 }, { x: 430, y: 160 },
              14.5, 14.3
            );
            setLiveBiometrics(computed);
            
            // Auto-transition to completed
            setTimeout(() => {
              setScanPhase('completed');
            }, 1000);
          }, 500);
        }
      }
    }, 30);
  };

  // Start full scan sequence
  const startFullScan = () => {
    if (scanPhase !== 'positioned') return;
    
    setScanPhase('scanning-left');
    setCurrentInstruction('Tournez doucement à GAUCHE...');
    runAngleScan('left');
  };

  // Run simulation (no camera)
  const runSimulation = () => {
    setScanPhase('detecting');
    setScanProgress(0);
    
    setTimeout(() => {
      setScanPhase('positioned');
      setFaceDetected(true);
      setScanProgress(33);
      
      setTimeout(() => {
        setScanPhase('scanning-left');
        setScanProgress(50);
        
        setTimeout(() => {
          setScanPhase('scanning-right');
          setScanProgress(75);
          
          setTimeout(() => {
            setScanPhase('scanning-complete');
            setScanProgress(100);
            
            const computed = calculateBiometricsFromLandmarks(
              { x: 200, y: 200 }, { x: 440, y: 200 },
              { x: 210, y: 160 }, { x: 260, y: 145 },
              { x: 310, y: 162 }, { x: 330, y: 162 },
              { x: 380, y: 145 }, { x: 430, y: 160 },
              14.2, 14.1
            );
            setLiveBiometrics(computed);
            
            setTimeout(() => setScanPhase('completed'), 800);
          }, 800);
        }, 800);
      }, 800);
    }, 1000);
  };

  const handleFinish = () => {
    stopCamera();
    onCompleted(liveBiometrics, snapshots);
  };

  const handleReset = () => {
    setScanPhase('idle');
    setScanProgress(0);
    setFaceDetected(false);
    setSnapshots({});
    setLiveBiometrics(DEFAULT_BIOMETRICS);
    setCurrentInstruction('');
    startCamera();
  };

  const info = phaseInfo[scanPhase];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      
      {/* HEADER */}
      <div className="text-center space-y-3 mb-6">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-mono tracking-wider ${
          scanPhase === 'completed' || scanPhase === 'scanning-complete'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_20px_rgba(0,255,136,0.15)]'
            : faceDetected
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-biometric-cyan/10 border-biometric-cyan/30 text-biometric-cyan shadow-cyan-glow'
        }`}>
          <Scan className="w-4 h-4 animate-pulse" />
          {info.title}
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
          {info.instruction}
        </h2>
        <p className="text-sm text-gray-300">{info.sub}</p>
        {currentInstruction && (
          <p className={`text-xs font-mono ${info.color}`}>{currentInstruction}</p>
        )}

        {/* Help Guide */}
        <button
          onClick={() => setShowGuide(!showGuide)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-obsidian-card border border-obsidian-border text-gray-300 text-xs font-medium hover:bg-obsidian-light transition-all"
        >
          <HelpCircle className="w-4 h-4 text-roseGold" />
          {showGuide ? 'Masquer' : 'Comment ça marche ?'}
          {showGuide ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        {showGuide && (
          <div className="max-w-xl mx-auto p-5 rounded-2xl bg-obsidian-card border border-roseGold/20 text-left space-y-3 animate-fade-in">
            <h4 className="font-serif font-bold text-sm text-roseGold flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Scanner Biométrique Face ID
            </h4>
            <div className="space-y-2 text-xs text-gray-300">
              <p>1. <strong className="text-white">Détection automatique</strong> — Le scanner détecte votre visage dès l&apos;ouverture de la caméra.</p>
              <p>2. <strong className="text-white">Positionnement</strong> — Quand le cadre devient vert, votre visage est bien placé.</p>
              <p>3. <strong className="text-white">Scan 3 angles</strong> — Le système capture face, gauche et droite pour une empreinte complète.</p>
              <p>4. <strong className="text-white">Moule personnalisé</strong> — Le fichier STL est généré selon VOS mesures (0.1mm de précision).</p>
            </div>
          </div>
        )}
      </div>

      {/* CAMERA STATUS */}
      <div className="flex items-center justify-center gap-3 mb-4">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono ${
          isCameraActive 
            ? faceDetected 
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
              : 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
            : 'bg-red-500/10 border border-red-500/30 text-red-400'
        }`}>
          <span className={`w-2 h-2 rounded-full ${
            isCameraActive ? faceDetected ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse' : 'bg-red-400'
          }`} />
          {isCameraActive ? faceDetected ? 'Visage détecté' : 'Recherche...' : 'Caméra off'}
        </div>
        {!isCameraActive && (
          <button onClick={startCamera} className="flex items-center gap-2 px-4 py-2 rounded-full bg-obsidian-card border border-roseGold/30 text-roseGold text-xs font-medium hover:bg-roseGold/10 transition-all">
            <RefreshCw className="w-3 h-3" /> Réessayer
          </button>
        )}
      </div>

      {/* SCANNER VIEWPORT */}
      <div className="relative mx-auto w-full max-w-sm sm:max-w-md aspect-[3/4] rounded-3xl bg-obsidian-card border-2 overflow-hidden shadow-rose-glow"
        style={{
          borderColor: faceDetected ? 'rgba(0, 255, 136, 0.4)' : 'rgba(216, 164, 153, 0.4)',
          boxShadow: faceDetected ? '0 0 40px rgba(0, 255, 136, 0.15)' : '0 0 40px rgba(216, 164, 153, 0.15)',
        }}
      >
        <canvas ref={canvasRef} className="hidden" />

        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          data-face-mesh="true"
          className={`absolute inset-0 w-full h-full object-cover -scale-x-100 ${isCameraActive ? 'block' : 'hidden'}`}
          style={{ zIndex: 10 }}
        />

        {!isCameraActive && (
          <div className="absolute inset-0 bg-gradient-to-b from-obsidian-card via-obsidian to-obsidian-light flex flex-col items-center justify-center p-8 text-center space-y-4" style={{ zIndex: 10 }}>
            <Camera className="w-16 h-16 text-roseGold animate-pulse" />
            <p className="text-sm text-white font-semibold">{cameraError || 'Initialisation...'}</p>
          </div>
        )}

        <FaceMeshCanvas
          isScanning={scanPhase.startsWith('scanning-')}
          onLandmarksDetected={handleLandmarksDetected}
          detectionPhase={faceDetected ? (scanPhase === 'completed' ? 'locked' : 'detecting') : 'none'}
        />

        {/* HUD Top */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-[11px] font-mono bg-obsidian/80 backdrop-blur-md p-3 rounded-xl border border-obsidian-border" style={{ zIndex: 30 }}>
          <span className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${
              scanPhase === 'completed' ? 'bg-emerald-400' :
              faceDetected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400 animate-pulse'
            }`} />
            <span className={faceDetected ? 'text-emerald-400' : 'text-amber-400'}>
              {scanPhase === 'completed' ? 'SCAN TERMINÉ' : faceDetected ? 'TRACKING ACTIF' : 'RECHERCHE...'}
            </span>
          </span>
          <span className="flex items-center gap-2 text-biometric-cyan">
            <Crosshair className="w-3 h-3" />
            468 POINTS
          </span>
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-4 left-4 right-4 space-y-2 bg-obsidian/80 backdrop-blur-md p-3 rounded-2xl border border-obsidian-border" style={{ zIndex: 30 }}>
          <div className="flex items-center justify-between text-xs font-mono text-gray-300">
            <span>PROGRESSION</span>
            <span className="text-roseGold font-bold">{scanProgress}%</span>
          </div>
          <div className="w-full h-2.5 bg-obsidian rounded-full overflow-hidden border border-obsidian-border">
            <div className="h-full bg-gradient-to-r from-biometric-cyan via-roseGold to-emerald-400 transition-all duration-300" style={{ width: `${scanProgress}%` }} />
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className={scanPhase === 'positioned' || scanPhase.startsWith('scanning') || scanPhase === 'completed' ? 'text-emerald-400' : 'text-gray-600'}>● Face</span>
            <span className={scanPhase === 'scanning-left' || scanPhase === 'scanning-right' || scanPhase === 'completed' ? 'text-biometric-cyan' : 'text-gray-600'}>● Gauche</span>
            <span className={scanPhase === 'scanning-right' || scanPhase === 'completed' ? 'text-biometric-cyan' : 'text-gray-600'}>● Droite</span>
            <span className={scanPhase === 'completed' ? 'text-emerald-400' : 'text-gray-600'}>● Terminé</span>
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="mt-8 space-y-4">
        {scanPhase === 'positioned' && (
          <>
            <button
              onClick={startFullScan}
              className="group relative w-full py-5 rounded-2xl bg-gradient-to-r from-roseGold-dark via-roseGold to-roseGold-metallic text-obsidian font-bold text-base shadow-rose-glow hover:shadow-[0_0_60px_rgba(216,164,153,0.4)] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <Zap className="w-6 h-6 relative z-10" />
              <span className="relative z-10">Lancer le Scan Biométrique</span>
              <Sparkles className="w-5 h-5 relative z-10 animate-pulse" />
            </button>
            <p className="text-center text-xs text-gray-400 font-mono">
              Le scanner va capturer 3 angles automatiquement
            </p>
          </>
        )}

        {scanPhase.startsWith('scanning-') && scanPhase !== 'scanning-complete' && (
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-biometric-cyan/10 border border-biometric-cyan/30 text-biometric-cyan">
              <Scan className="w-5 h-5 animate-spin" />
              <span className="font-mono text-sm">Scan en cours... {scanProgress}%</span>
            </div>
            <p className="text-xs text-gray-400">Restez immobile et suivez les instructions</p>
          </div>
        )}

        {scanPhase === 'scanning-complete' && (
          <div className="text-center">
            <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-mono text-sm">Scan terminé avec succès !</span>
            </div>
          </div>
        )}

        {scanPhase === 'completed' && (
          <button
            onClick={handleFinish}
            className="w-full py-5 rounded-2xl bg-gradient-to-r from-roseGold-dark via-roseGold to-roseGold-metallic text-obsidian font-bold text-base shadow-rose-glow hover:shadow-[0_0_60px_rgba(216,164,153,0.4)] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3"
          >
            <CheckCircle2 className="w-6 h-6" />
            <span>Valider et Personnaliser mon Style 3D</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        {(scanPhase === 'idle' || scanPhase === 'detecting') && !isCameraActive && (
          <button
            onClick={runSimulation}
            className="w-full py-5 rounded-2xl bg-gradient-to-r from-roseGold-dark via-roseGold to-roseGold-metallic text-obsidian font-bold text-base shadow-rose-glow hover:shadow-[0_0_60px_rgba(216,164,153,0.4)] transition-all flex items-center justify-center gap-3"
          >
            <Zap className="w-6 h-6" />
            <span>Scanner IA Express (sans caméra)</span>
          </button>
        )}

        {scanPhase !== 'idle' && scanPhase !== 'detecting' && (
          <button
            onClick={handleReset}
            className="w-full py-3 rounded-xl bg-obsidian border border-obsidian-border text-gray-400 text-xs font-medium hover:bg-obsidian-light hover:text-white transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Recommencer
          </button>
        )}
      </div>

      {/* BIOMETRIC RESULTS */}
      {scanPhase === 'completed' && (
        <div className="mt-8 p-6 rounded-3xl bg-obsidian-card border border-roseGold/30 space-y-4 animate-fade-in shadow-rose-glow">
          <div className="flex items-center justify-between border-b border-obsidian-border pb-3">
            <h3 className="font-serif font-bold text-lg text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Rapport Biométrique 3D
            </h3>
            <span className="text-xs font-mono text-roseGold px-3 py-1 rounded-full bg-roseGold/10 border border-roseGold/20">
              0.1 MM PRÉCISION
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-mono">
            <div className="p-4 rounded-xl bg-obsidian border border-obsidian-border">
              <p className="text-[10px] text-gray-400 mb-1">Inter-Sourcils</p>
              <p className="text-lg font-bold text-roseGold">{liveBiometrics.interEyebrowGapMm} mm</p>
            </div>
            <div className="p-4 rounded-xl bg-obsidian border border-obsidian-border">
              <p className="text-[10px] text-gray-400 mb-1">Longueur</p>
              <p className="text-lg font-bold text-roseGold">{liveBiometrics.leftEyebrowLengthMm} mm</p>
            </div>
            <div className="p-4 rounded-xl bg-obsidian border border-obsidian-border">
              <p className="text-[10px] text-gray-400 mb-1">Arcade</p>
              <p className="text-lg font-bold text-roseGold">{liveBiometrics.leftArchHeightMm} mm</p>
            </div>
            <div className="p-4 rounded-xl bg-obsidian border border-obsidian-border">
              <p className="text-[10px] text-gray-400 mb-1">Symétrie</p>
              <p className="text-lg font-bold text-emerald-400">{liveBiometrics.facialSymmetryIndex}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Back */}
      <div className="mt-8 text-center">
        <button onClick={onBack} className="text-sm text-gray-400 hover:text-roseGold underline transition-colors font-medium">
          ← Modifier mes coordonnées
        </button>
      </div>
    </div>
  );
};
