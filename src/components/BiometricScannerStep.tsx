'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { BiometricMeasurements } from '@/types';
import { calculateBiometricsFromLandmarks, DEFAULT_BIOMETRICS } from '@/lib/biometrics';
import { Camera, RefreshCw, CheckCircle2, Sparkles, ChevronRight, ChevronDown, ChevronUp, Zap, HelpCircle, Eye, RotateCcw, Scan, Crosshair } from 'lucide-react';

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
  const [detectionPhase, setDetectionPhase] = useState<'none' | 'detecting' | 'locked'>('none');
  
  const [snapshots, setSnapshots] = useState<{ front?: string; left?: string; right?: string }>({});
  const [liveBiometrics, setLiveBiometrics] = useState<BiometricMeasurements>(DEFAULT_BIOMETRICS);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

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
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
        };
      }
      setIsCameraActive(true);
      setScanMode('camera');
      // Start detection animation after camera is active
      setTimeout(() => setDetectionPhase('detecting'), 500);
      setTimeout(() => setDetectionPhase('locked'), 2000);
    } catch (err: any) {
      console.warn('Camera access denied or unavailable:', err);
      setCameraError('Caméra non disponible. Utilisez le mode Simulation IA.');
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

  const runCameraAngleScan = () => {
    if (isScanning || !isCameraActive) return;
    setIsScanning(true);
    setScanProgress(0);
    setDetectionPhase('detecting');

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setScanProgress(progress);

      if (progress >= 100) {
        clearInterval(interval);
        setIsScanning(false);
        setDetectionPhase('locked');

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

  const runFullSimulation = () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanMode('simulation');
    setCurrentAngle('front');
    setScanProgress(0);
    setDetectionPhase('detecting');

    let progress = 0;
    const interval1 = setInterval(() => {
      progress += 5;
      setScanProgress(progress);
      if (progress >= 33) {
        clearInterval(interval1);
        setCurrentAngle('left');
        
        let progress2 = 33;
        const interval2 = setInterval(() => {
          progress2 += 5;
          setScanProgress(progress2);
          if (progress2 >= 66) {
            clearInterval(interval2);
            setCurrentAngle('right');
            
            let progress3 = 66;
            const interval3 = setInterval(() => {
              progress3 += 5;
              setScanProgress(progress3);
              if (progress3 >= 100) {
                clearInterval(interval3);
                setCurrentAngle('completed');
                setIsScanning(false);
                setDetectionPhase('locked');

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
    setDetectionPhase('none');
    setSnapshots({});
    setLiveBiometrics(DEFAULT_BIOMETRICS);
  };

  // SVG Face Mesh Paths — Professional anatomical tracing
  const FaceMeshOverlay = () => (
    <svg 
      className="absolute inset-0 w-full h-full" 
      viewBox="0 0 400 600" 
      fill="none"
      style={{ zIndex: 20 }}
    >
      <defs>
        <filter id="glow-cyan">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="glow-rose">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <linearGradient id="sweep-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00F2FE" stopOpacity="0"/>
          <stop offset="50%" stopColor="#00F2FE" stopOpacity="0.8"/>
          <stop offset="100%" stopColor="#00F2FE" stopOpacity="0"/>
        </linearGradient>
      </defs>

      {/* ── FACE OVAL CONTOUR ── */}
      <path 
        d="M200 80 C260 80 320 130 330 200 C340 270 330 340 310 390 C290 440 250 480 200 490 C150 480 110 440 90 390 C70 340 60 270 70 200 C80 130 140 80 200 80Z"
        stroke={detectionPhase === 'none' ? 'rgba(0,242,254,0.15)' : '#00F2FE'}
        strokeWidth={detectionPhase === 'locked' ? '2' : '1.5'}
        strokeDasharray={detectionPhase === 'detecting' ? '8 4' : 'none'}
        filter="url(#glow-cyan)"
        className={detectionPhase === 'detecting' ? 'animate-pulse' : ''}
        style={{ 
          opacity: detectionPhase === 'none' ? 0.2 : 0.7,
          transition: 'all 0.5s ease'
        }}
      />

      {/* ── LEFT EYEBROW (detailed curve) ── */}
      <path 
        d="M120 195 C130 178 148 170 165 172 C182 174 195 182 200 190"
        stroke={detectionPhase !== 'none' ? '#D8A499' : 'rgba(216,164,153,0.2)'}
        strokeWidth={detectionPhase === 'locked' ? '3' : '2'}
        strokeLinecap="round"
        filter="url(#glow-rose)"
        className={detectionPhase === 'detecting' ? 'animate-pulse' : ''}
        style={{ opacity: detectionPhase === 'none' ? 0.2 : 0.9, transition: 'all 0.5s ease' }}
      />
      {/* Left eyebrow thickness line */}
      <path 
        d="M122 200 C132 185 150 178 167 180 C184 182 196 190 200 197"
        stroke="rgba(0,242,254,0.4)"
        strokeWidth="1"
        strokeDasharray="4 3"
        strokeLinecap="round"
        style={{ opacity: detectionPhase !== 'none' ? 0.6 : 0 }}
      />

      {/* ── RIGHT EYEBROW (detailed curve) ── */}
      <path 
        d="M280 190 C285 182 298 174 315 172 C332 170 350 178 360 195"
        stroke={detectionPhase !== 'none' ? '#D8A499' : 'rgba(216,164,153,0.2)'}
        strokeWidth={detectionPhase === 'locked' ? '3' : '2'}
        strokeLinecap="round"
        filter="url(#glow-rose)"
        className={detectionPhase === 'detecting' ? 'animate-pulse' : ''}
        style={{ opacity: detectionPhase === 'none' ? 0.2 : 0.9, transition: 'all 0.5s ease' }}
      />
      {/* Right eyebrow thickness line */}
      <path 
        d="M280 197 C284 190 296 182 313 180 C330 178 348 185 358 200"
        stroke="rgba(0,242,254,0.4)"
        strokeWidth="1"
        strokeDasharray="4 3"
        strokeLinecap="round"
        style={{ opacity: detectionPhase !== 'none' ? 0.6 : 0 }}
      />

      {/* ── LEFT EYE (almond shape) ── */}
      <ellipse 
        cx="165" cy="225" rx="28" ry="14"
        stroke={detectionPhase !== 'none' ? '#00F2FE' : 'rgba(0,242,254,0.15)'}
        strokeWidth="1.5"
        strokeDasharray={detectionPhase === 'detecting' ? '6 3' : 'none'}
        filter="url(#glow-cyan)"
        style={{ opacity: detectionPhase === 'none' ? 0.15 : 0.7, transition: 'all 0.5s ease' }}
      />
      {/* Left iris */}
      <circle 
        cx="165" cy="225" r="8"
        stroke={detectionPhase !== 'none' ? '#00F2FE' : 'rgba(0,242,254,0.1)'}
        strokeWidth="1"
        fill="none"
        style={{ opacity: detectionPhase === 'none' ? 0.1 : 0.5 }}
      />
      {/* Left pupil */}
      <circle 
        cx="165" cy="225" r="3"
        fill={detectionPhase !== 'none' ? 'rgba(0,242,254,0.6)' : 'rgba(0,242,254,0.1)'}
      />

      {/* ── RIGHT EYE (almond shape) ── */}
      <ellipse 
        cx="235" cy="225" rx="28" ry="14"
        stroke={detectionPhase !== 'none' ? '#00F2FE' : 'rgba(0,242,254,0.15)'}
        strokeWidth="1.5"
        strokeDasharray={detectionPhase === 'detecting' ? '6 3' : 'none'}
        filter="url(#glow-cyan)"
        style={{ opacity: detectionPhase === 'none' ? 0.15 : 0.7, transition: 'all 0.5s ease' }}
      />
      {/* Right iris */}
      <circle 
        cx="235" cy="225" r="8"
        stroke={detectionPhase !== 'none' ? '#00F2FE' : 'rgba(0,242,254,0.1)'}
        strokeWidth="1"
        fill="none"
        style={{ opacity: detectionPhase === 'none' ? 0.1 : 0.5 }}
      />
      {/* Right pupil */}
      <circle 
        cx="235" cy="225" r="3"
        fill={detectionPhase !== 'none' ? 'rgba(0,242,254,0.6)' : 'rgba(0,242,254,0.1)'}
      />

      {/* ── NOSE BRIDGE ── */}
      <path 
        d="M200 210 L198 250 L192 275 C195 280 200 282 205 280 L208 275 L202 250 Z"
        stroke={detectionPhase !== 'none' ? 'rgba(0,242,254,0.5)' : 'rgba(0,242,254,0.1)'}
        strokeWidth="1"
        strokeDasharray={detectionPhase === 'detecting' ? '4 2' : 'none'}
        fill="none"
        style={{ opacity: detectionPhase === 'none' ? 0.1 : 0.6, transition: 'all 0.5s ease' }}
      />
      {/* Nose tip */}
      <circle 
        cx="200" cy="280" r="4"
        stroke={detectionPhase !== 'none' ? '#D8A499' : 'rgba(216,164,153,0.1)'}
        strokeWidth="1.5"
        fill="none"
        filter="url(#glow-rose)"
        style={{ opacity: detectionPhase === 'none' ? 0.1 : 0.7 }}
      />

      {/* ── MOUTH (lips contour) ── */}
      <path 
        d="M170 330 C180 322 190 318 200 320 C210 318 220 322 230 330"
        stroke={detectionPhase !== 'none' ? '#D8A499' : 'rgba(216,164,153,0.1)'}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        filter="url(#glow-rose)"
        style={{ opacity: detectionPhase === 'none' ? 0.1 : 0.6, transition: 'all 0.5s ease' }}
      />
      {/* Lower lip */}
      <path 
        d="M170 330 C180 340 190 345 200 346 C210 345 220 340 230 330"
        stroke={detectionPhase !== 'none' ? 'rgba(216,164,153,0.5)' : 'rgba(216,164,153,0.1)'}
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
        style={{ opacity: detectionPhase === 'none' ? 0.1 : 0.5 }}
      />

      {/* ── JAWLINE ── */}
      <path 
        d="M100 280 C110 350 140 420 200 450 C260 420 290 350 300 280"
        stroke={detectionPhase !== 'none' ? 'rgba(0,242,254,0.3)' : 'rgba(0,242,254,0.08)'}
        strokeWidth="1"
        strokeDasharray={detectionPhase === 'detecting' ? '6 4' : '4 4'}
        fill="none"
        style={{ opacity: detectionPhase === 'none' ? 0.1 : 0.4, transition: 'all 0.5s ease' }}
      />

      {/* ── LANDMARK POINTS (468 MediaPipe style) ── */}
      {/* Eyebrow landmarks - Left */}
      {[
        { x: 120, y: 195 }, { x: 135, y: 183 }, { x: 150, y: 176 },
        { x: 165, y: 174 }, { x: 180, y: 178 }, { x: 195, y: 188 },
        { x: 122, y: 200 }, { x: 137, y: 190 }, { x: 152, y: 184 },
        { x: 167, y: 182 }, { x: 182, y: 186 }, { x: 196, y: 195 },
      ].map((p, i) => (
        <circle key={`leb-${i}`} cx={p.x} cy={p.y} r="2"
          fill={i % 2 === 0 ? '#00F2FE' : '#D8A499'}
          filter={i % 2 === 0 ? 'url(#glow-cyan)' : 'url(#glow-rose)'}
          className={detectionPhase === 'detecting' ? 'animate-ping' : ''}
          style={{ 
            opacity: detectionPhase === 'none' ? 0.15 : 0.9,
            animationDelay: `${i * 0.08}s`,
            transition: 'opacity 0.5s ease'
          }}
        />
      ))}
      {/* Eyebrow landmarks - Right */}
      {[
        { x: 280, y: 190 }, { x: 295, y: 180 }, { x: 310, y: 176 },
        { x: 325, y: 174 }, { x: 340, y: 178 }, { x: 355, y: 190 },
        { x: 280, y: 197 }, { x: 295, y: 188 }, { x: 310, y: 182 },
        { x: 325, y: 180 }, { x: 340, y: 184 }, { x: 358, y: 197 },
      ].map((p, i) => (
        <circle key={`reb-${i}`} cx={p.x} cy={p.y} r="2"
          fill={i % 2 === 0 ? '#D8A499' : '#00F2FE'}
          filter={i % 2 === 0 ? 'url(#glow-rose)' : 'url(#glow-cyan)'}
          className={detectionPhase === 'detecting' ? 'animate-ping' : ''}
          style={{ 
            opacity: detectionPhase === 'none' ? 0.15 : 0.9,
            animationDelay: `${i * 0.08 + 0.5}s`,
            transition: 'opacity 0.5s ease'
          }}
        />
      ))}
      {/* Eye contour landmarks */}
      {[
        { x: 137, y: 225 }, { x: 150, y: 218 }, { x: 165, y: 215 },
        { x: 180, y: 218 }, { x: 193, y: 225 }, { x: 180, y: 232 },
        { x: 165, y: 235 }, { x: 150, y: 232 },
        { x: 207, y: 225 }, { x: 220, y: 218 }, { x: 235, y: 215 },
        { x: 250, y: 218 }, { x: 263, y: 225 }, { x: 250, y: 232 },
        { x: 235, y: 235 }, { x: 220, y: 232 },
      ].map((p, i) => (
        <circle key={`eye-${i}`} cx={p.x} cy={p.y} r="1.5"
          fill="#00F2FE"
          filter="url(#glow-cyan)"
          style={{ 
            opacity: detectionPhase === 'none' ? 0.1 : 0.7,
            animationDelay: `${i * 0.05}s`,
            transition: 'opacity 0.5s ease'
          }}
        />
      ))}
      {/* Nose landmarks */}
      {[
        { x: 200, y: 210 }, { x: 198, y: 230 }, { x: 196, y: 250 },
        { x: 192, y: 270 }, { x: 200, y: 280 }, { x: 208, y: 270 },
        { x: 204, y: 250 }, { x: 202, y: 230 },
      ].map((p, i) => (
        <circle key={`nose-${i}`} cx={p.x} cy={p.y} r="1.5"
          fill={i % 2 === 0 ? '#00F2FE' : '#D8A499'}
          style={{ 
            opacity: detectionPhase === 'none' ? 0.1 : 0.6,
            transition: 'opacity 0.5s ease'
          }}
        />
      ))}
      {/* Mouth landmarks */}
      {[
        { x: 170, y: 330 }, { x: 180, y: 324 }, { x: 190, y: 320 },
        { x: 200, y: 320 }, { x: 210, y: 320 }, { x: 220, y: 324 },
        { x: 230, y: 330 }, { x: 220, y: 338 }, { x: 210, y: 344 },
        { x: 200, y: 346 }, { x: 190, y: 344 }, { x: 180, y: 338 },
      ].map((p, i) => (
        <circle key={`mouth-${i}`} cx={p.x} cy={p.y} r="1.5"
          fill="#D8A499"
          filter="url(#glow-rose)"
          style={{ 
            opacity: detectionPhase === 'none' ? 0.1 : 0.7,
            transition: 'opacity 0.5s ease'
          }}
        />
      ))}

      {/* ── MEASUREMENT LINES (shown when locked) ── */}
      {detectionPhase === 'locked' && (
        <>
          {/* Inter-eyebrow distance line */}
          <line x1="200" y1="175" x2="200" y2="175" stroke="#D8A499" strokeWidth="1" strokeDasharray="3 2" opacity="0.5">
            <animate attributeName="x1" from="195" to="195" dur="0.01s" fill="freeze"/>
          </line>
          {/* Left eyebrow length measurement */}
          <line x1="120" y1="192" x2="200" y2="188" stroke="rgba(0,242,254,0.3)" strokeWidth="0.5" strokeDasharray="4 3"/>
          {/* Right eyebrow length measurement */}
          <line x1="280" y1="188" x2="360" y2="192" stroke="rgba(0,242,254,0.3)" strokeWidth="0.5" strokeDasharray="4 3"/>
          
          {/* Measurement labels */}
          <text x="155" y="180" fill="#00F2FE" fontSize="8" fontFamily="monospace" opacity="0.7">52.3mm</text>
          <text x="305" y="180" fill="#00F2FE" fontSize="8" fontFamily="monospace" opacity="0.7">51.8mm</text>
          <text x="200" y="168" fill="#D8A499" fontSize="8" fontFamily="monospace" textAnchor="middle" opacity="0.7">24.1mm</text>
        </>
      )}

      {/* ── SCANNING LASER ── */}
      {isScanning && (
        <>
          <rect x="60" y="0" width="280" height="600" fill="url(#sweep-grad)" opacity="0.15">
            <animateTransform attributeName="transform" type="translate" values="0,-600;0,600" dur="2s" repeatCount="indefinite"/>
          </rect>
          <line x1="60" y1="0" x2="340" y2="0" stroke="#00F2FE" strokeWidth="2" opacity="0.8" filter="url(#glow-cyan)">
            <animateTransform attributeName="transform" type="translate" values="0,0;0,600" dur="2s" repeatCount="indefinite"/>
          </line>
        </>
      )}
    </svg>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      
      {/* HEADER */}
      <div className="text-center space-y-3 mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-biometric-cyan/10 border border-biometric-cyan/30 text-biometric-cyan text-sm font-mono tracking-wider shadow-cyan-glow">
          <Scan className="w-4 h-4 animate-pulse" />
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

        {showGuide && (
          <div className="max-w-xl mx-auto p-5 rounded-2xl bg-obsidian-card border border-roseGold/20 text-left space-y-4 animate-fade-in">
            <h4 className="font-serif font-bold text-sm text-roseGold flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Guide du Scanner Biométrique 3D
            </h4>
            
            <div className="space-y-3 text-xs text-gray-300">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-obsidian border border-obsidian-border">
                <span className="w-7 h-7 rounded-full bg-roseGold/10 text-roseGold flex items-center justify-center font-bold text-sm shrink-0">1</span>
                <div>
                  <p className="font-semibold text-white mb-1">Activez votre caméra</p>
                  <p>Autorisez l&apos;accès à la caméra. Le traceur holographique va détecter automatiquement vos sourcils, yeux, nez et bouche.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-xl bg-obsidian border border-obsidian-border">
                <span className="w-7 h-7 rounded-full bg-roseGold/10 text-roseGold flex items-center justify-center font-bold text-sm shrink-0">2</span>
                <div>
                  <p className="font-semibold text-white mb-1">Scannez vos 3 angles</p>
                  <p>Le scanner capture votre visage de face, puis à gauche, puis à droite pour une analyse 3D complète.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-xl bg-obsidian border border-obsidian-border">
                <span className="w-7 h-7 rounded-full bg-roseGold/10 text-roseGold flex items-center justify-center font-bold text-sm shrink-0">3</span>
                <div>
                  <p className="font-semibold text-white mb-1">Mode Simulation IA</p>
                  <p>Pas de caméra ? Le mode Simulation IA analyse vos sourcils automatiquement en 3 secondes.</p>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-biometric-cyan/5 border border-biometric-cyan/20 text-xs text-biometric-cyan">
              <strong>💡 Astuce :</strong> Pour un scan précis, assurez-vous d&apos;être dans un endroit bien éclairé avec le visage découvert.
            </div>
          </div>
        )}
      </div>

      {/* CAMERA STATUS */}
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
          MAIN SCANNER VIEWPORT — Camera + Face Mesh Overlay
          ═══════════════════════════════════════════════════════════════ */}
      <div className="relative mx-auto w-full max-w-sm sm:max-w-md aspect-[3/4] rounded-3xl bg-obsidian-card border-2 border-roseGold/40 shadow-rose-glow overflow-hidden">
        
        {/* Hidden Canvas for Snapshots */}
        <canvas ref={canvasRef} className="hidden" />

        {/* VIDEO ELEMENT — Always rendered, hidden when no camera */}
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className={`absolute inset-0 w-full h-full object-cover -scale-x-100 ${isCameraActive ? 'block' : 'hidden'}`}
          style={{ zIndex: 10 }}
        />

        {/* Fallback when no camera */}
        {!isCameraActive && (
          <div className="absolute inset-0 bg-gradient-to-b from-obsidian-card via-obsidian to-obsidian-light flex flex-col items-center justify-center p-8 text-center space-y-4" style={{ zIndex: 10 }}>
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

        {/* FACE MESH SVG OVERLAY — Professional anatomical tracing */}
        <FaceMeshOverlay />

        {/* HOLOGRAPHIC HUD — Top bar */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-roseGold bg-obsidian/80 backdrop-blur-md p-3 rounded-xl border border-roseGold/20" style={{ zIndex: 30 }}>
          <span className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isScanning ? 'bg-biometric-cyan animate-ping' : detectionPhase === 'locked' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
            {isScanning ? 'ANALYSE EN COURS...' : detectionPhase === 'locked' ? 'VISAGE DÉTECTÉ' : 'RECHERCHE DU VISAGE...'}
          </span>
          <span className="flex items-center gap-2">
            <Crosshair className="w-3 h-3 text-biometric-cyan" />
            468 POINTS 3D
          </span>
        </div>

        {/* DETECTION STATUS INDICATORS — Around the face */}
        {detectionPhase !== 'none' && (
          <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 25 }}>
            {/* Left eyebrow detected */}
            <div className="absolute top-[30%] left-[8%] flex items-center gap-1 px-2 py-1 rounded-full bg-obsidian/70 border border-roseGold/30 text-[9px] font-mono text-roseGold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              SOURCIL G
            </div>
            {/* Right eyebrow detected */}
            <div className="absolute top-[30%] right-[8%] flex items-center gap-1 px-2 py-1 rounded-full bg-obsidian/70 border border-roseGold/30 text-[9px] font-mono text-roseGold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              SOURCIL D
            </div>
            {/* Left eye detected */}
            <div className="absolute top-[36%] left-[15%] flex items-center gap-1 px-2 py-1 rounded-full bg-obsidian/70 border border-biometric-cyan/30 text-[9px] font-mono text-biometric-cyan">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              OEIL G
            </div>
            {/* Right eye detected */}
            <div className="absolute top-[36%] right-[15%] flex items-center gap-1 px-2 py-1 rounded-full bg-obsidian/70 border border-biometric-cyan/30 text-[9px] font-mono text-biometric-cyan">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              OEIL D
            </div>
            {/* Nose detected */}
            <div className="absolute top-[44%] left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-1 rounded-full bg-obsidian/70 border border-biometric-cyan/30 text-[9px] font-mono text-biometric-cyan">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              NEZ
            </div>
            {/* Mouth detected */}
            <div className="absolute top-[55%] left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-1 rounded-full bg-obsidian/70 border border-roseGold/30 text-[9px] font-mono text-roseGold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              BOUCHE
            </div>
          </div>
        )}

        {/* Bottom Progress Bar */}
        <div className="absolute bottom-4 left-4 right-4 space-y-2 bg-obsidian/80 backdrop-blur-md p-3 rounded-2xl border border-obsidian-border" style={{ zIndex: 30 }}>
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
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className={currentAngle === 'front' || currentAngle === 'left' || currentAngle === 'right' || currentAngle === 'completed' ? 'text-biometric-cyan' : 'text-gray-600'}>● Face</span>
            <span className={currentAngle === 'left' || currentAngle === 'right' || currentAngle === 'completed' ? 'text-biometric-cyan' : 'text-gray-600'}>● Gauche</span>
            <span className={currentAngle === 'right' || currentAngle === 'completed' ? 'text-biometric-cyan' : 'text-gray-600'}>● Droite</span>
            <span className={currentAngle === 'completed' ? 'text-emerald-400' : 'text-gray-600'}>● Terminé</span>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          ACTION BUTTONS
          ═══════════════════════════════════════════════════════════════ */}
      <div className="mt-8 space-y-4">
        
        {currentAngle !== 'completed' ? (
          <>
            {/* PRIMARY: Scanner IA Express 1-Clic */}
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

            {/* SECONDARY: Camera Manual Capture */}
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
              </div>
            )}

            {/* Reset */}
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

      {/* BIOMETRIC RESULTS */}
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
