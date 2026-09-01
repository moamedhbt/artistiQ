'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { BiometricMeasurements } from '@/types';
import { calculateBiometricsFromLandmarks, DEFAULT_BIOMETRICS } from '@/lib/biometrics';
import { Camera, RefreshCw, CheckCircle2, Sparkles, ChevronRight, ChevronDown, ChevronUp, Zap, HelpCircle, Eye, RotateCcw, Scan, Crosshair } from 'lucide-react';

interface BiometricScannerStepProps {
  onCompleted: (biometrics: BiometricMeasurements, snapshots?: { front?: string; left?: string; right?: string }) => void;
  onBack: () => void;
}

type ScanPhase = 'idle' | 'detecting' | 'positioned' | 'scanning' | 'completed';

export const BiometricScannerStep: React.FC<BiometricScannerStepProps> = ({
  onCompleted,
  onBack,
}) => {
  const [phase, setPhase] = useState<ScanPhase>('idle');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [showGuide, setShowGuide] = useState(false);
  const [currentAngle, setCurrentAngle] = useState<'front' | 'left' | 'right'>('front');
  const [faceDetected, setFaceDetected] = useState(false);
  const [laserY, setLaserY] = useState(0);
  
  const [snapshots, setSnapshots] = useState<{ front?: string; left?: string; right?: string }>({});
  const [biometrics, setBiometrics] = useState<BiometricMeasurements>(DEFAULT_BIOMETRICS);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const laserRef = useRef<number>(0);

  // Laser animation
  useEffect(() => {
    if (phase !== 'scanning') return;
    const animate = () => {
      laserRef.current = requestAnimationFrame(animate);
      setLaserY(prev => (prev + 0.5) % 100);
    };
    laserRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(laserRef.current);
  }, [phase]);

  // Start camera
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
        videoRef.current.onloadedmetadata = () => videoRef.current?.play();
      }
      setCameraActive(true);
      
      // Auto-detect after 2 seconds
      setTimeout(() => {
        setPhase('detecting');
        setTimeout(() => {
          setFaceDetected(true);
          setPhase('positioned');
        }, 1500);
      }, 1000);
      
    } catch (err: any) {
      setCameraError('Caméra non disponible');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  // Capture snapshot
  const capture = useCallback(() => {
    if (!canvasRef.current || !videoRef.current) return '';
    const c = canvasRef.current;
    c.width = videoRef.current.videoWidth || 640;
    c.height = videoRef.current.videoHeight || 480;
    const ctx = c.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, c.width, c.height);
      return c.toDataURL('image/jpeg', 0.85);
    }
    return '';
  }, []);

  // Run scan
  const startScan = () => {
    if (phase !== 'positioned') return;
    setPhase('scanning');
    setCurrentAngle('front');
    setProgress(0);

    let p = 0;
    const interval = setInterval(() => {
      p += 2;
      setProgress(p);

      if (p === 33) {
        setSnapshots(prev => ({ ...prev, front: capture() }));
        setCurrentAngle('left');
      } else if (p === 66) {
        setSnapshots(prev => ({ ...prev, left: capture() }));
        setCurrentAngle('right');
      } else if (p >= 100) {
        clearInterval(interval);
        setSnapshots(prev => ({ ...prev, right: capture() }));
        
        const computed = calculateBiometricsFromLandmarks(
          { x: 200, y: 200 }, { x: 440, y: 200 },
          { x: 210, y: 160 }, { x: 260, y: 145 },
          { x: 310, y: 162 }, { x: 330, y: 162 },
          { x: 380, y: 145 }, { x: 430, y: 160 },
          14.5, 14.3
        );
        setBiometrics(computed);
        setPhase('completed');
      }
    }, 30);
  };

  // Simulation mode
  const runSimulation = () => {
    setPhase('detecting');
    setProgress(0);
    
    setTimeout(() => {
      setFaceDetected(true);
      setPhase('positioned');
      
      setTimeout(() => {
        setPhase('scanning');
        setCurrentAngle('front');
        
        let p = 0;
        const interval = setInterval(() => {
          p += 3;
          setProgress(p);
          if (p === 33) setCurrentAngle('left');
          if (p === 66) setCurrentAngle('right');
          if (p >= 100) {
            clearInterval(interval);
            const computed = calculateBiometricsFromLandmarks(
              { x: 200, y: 200 }, { x: 440, y: 200 },
              { x: 210, y: 160 }, { x: 260, y: 145 },
              { x: 310, y: 162 }, { x: 330, y: 162 },
              { x: 380, y: 145 }, { x: 430, y: 160 },
              14.2, 14.1
            );
            setBiometrics(computed);
            setPhase('completed');
          }
        }, 30);
      }, 500);
    }, 1000);
  };

  const handleFinish = () => {
    stopCamera();
    onCompleted(biometrics, snapshots);
  };

  const handleReset = () => {
    setPhase('idle');
    setProgress(0);
    setFaceDetected(false);
    setSnapshots({});
    setBiometrics(DEFAULT_BIOMETRICS);
    startCamera();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      
      {/* HEADER */}
      <div className="text-center space-y-3 mb-6">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-mono tracking-wider ${
          phase === 'completed' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
          faceDetected ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
          'bg-biometric-cyan/10 border-biometric-cyan/30 text-biometric-cyan'
        }`}>
          <Scan className="w-4 h-4" />
          {phase === 'idle' && 'Initialisation...'}
          {phase === 'detecting' && 'Détection en cours...'}
          {phase === 'positioned' && 'Visage détecté ✓'}
          {phase === 'scanning' && `Scan ${currentAngle.toUpperCase()}...`}
          {phase === 'completed' && 'Scan terminé ✓'}
        </div>

        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
          {phase === 'idle' && 'Placez votre visage dans le cadre'}
          {phase === 'detecting' && 'Recherche de votre visage...'}
          {phase === 'positioned' && 'Parfait ! Lancez le scan'}
          {phase === 'scanning' && currentAngle === 'front' && 'Regardez droit devant'}
          {phase === 'scanning' && currentAngle === 'left' && 'Tournez à GAUCHE'}
          {phase === 'scanning' && currentAngle === 'right' && 'Tournez à DROITE'}
          {phase === 'completed' && 'Empreinte biométrique extraite'}
        </h2>

        <p className="text-sm text-gray-300">
          {phase === 'scanning' && 'Restez immobile pendant l\'analyse'}
          {phase === 'positioned' && 'Le scanner va analyser vos sourcils sous 3 angles'}
          {phase === 'completed' && 'Prêt pour la personnalisation en Studio 3D'}
        </p>

        {/* Help Guide */}
        <button
          onClick={() => setShowGuide(!showGuide)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-obsidian-card border border-obsidian-border text-gray-300 text-xs font-medium hover:bg-obsidian-light transition-all"
        >
          <HelpCircle className="w-4 h-4 text-roseGold" />
          {showGuide ? 'Masquer' : 'Guide du scanner'}
          {showGuide ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        {showGuide && (
          <div className="max-w-xl mx-auto p-5 rounded-2xl bg-obsidian-card border border-roseGold/20 text-left space-y-3 animate-fade-in">
            <h4 className="font-serif font-bold text-sm text-roseGold flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Comment fonctionne le scanner
            </h4>
            <div className="space-y-2 text-xs text-gray-300">
              <p>📸 <strong className="text-white">1. Caméra</strong> — Placez votre visage dans l&apos;ovale vert</p>
              <p>🔄 <strong className="text-white">2. Rotation</strong> — Suivez les instructions pour tourner gauche/droite</p>
              <p>📊 <strong className="text-white">3. Analyse</strong> — Le système mesure vos sourcils au 0.1mm</p>
              <p>🖨️ <strong className="text-white">4. Moule</strong> — Un fichier STL personnalisé est généré</p>
            </div>
          </div>
        )}
      </div>

      {/* STATUS BAR */}
      <div className="flex items-center justify-center gap-3 mb-4">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono ${
          cameraActive ? faceDetected ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
          : 'bg-red-500/10 border border-red-500/30 text-red-400'
        }`}>
          <span className={`w-2 h-2 rounded-full ${cameraActive ? faceDetected ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse' : 'bg-red-400'}`} />
          {cameraActive ? faceDetected ? 'Visage détecté' : 'Recherche...' : 'Caméra off'}
        </div>
        {!cameraActive && (
          <button onClick={startCamera} className="flex items-center gap-2 px-4 py-2 rounded-full bg-obsidian-card border border-roseGold/30 text-roseGold text-xs font-medium hover:bg-roseGold/10 transition-all">
            <RefreshCw className="w-3 h-3" /> Réessayer
          </button>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          SCANNER VIEWPORT
          ═══════════════════════════════════════════════════════════════ */}
      <div className="relative mx-auto w-full max-w-sm sm:max-w-md aspect-[3/4] rounded-3xl bg-black overflow-hidden"
        style={{
          border: `2px solid ${faceDetected ? 'rgba(0, 255, 136, 0.5)' : 'rgba(216, 164, 153, 0.4)'}`,
          boxShadow: faceDetected ? '0 0 40px rgba(0, 255, 136, 0.2)' : '0 0 40px rgba(216, 164, 153, 0.15)',
        }}
      >
        <canvas ref={canvasRef} className="hidden" />

        {/* VIDEO */}
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className={`absolute inset-0 w-full h-full object-cover -scale-x-100 ${cameraActive ? 'block' : 'hidden'}`}
          style={{ zIndex: 1 }}
        />

        {/* No camera fallback */}
        {!cameraActive && (
          <div className="absolute inset-0 bg-gradient-to-b from-obsidian-card to-obsidian flex flex-col items-center justify-center p-8 text-center space-y-4" style={{ zIndex: 1 }}>
            <Camera className="w-16 h-16 text-roseGold animate-pulse" />
            <p className="text-sm text-white font-semibold">{cameraError || 'Initialisation...'}</p>
            <p className="text-xs text-gray-400">Autorisez l&apos;accès à la caméra</p>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            HOLOGRAPHIC OVERLAY (CSS + SVG)
            ═══════════════════════════════════════════════════════════════ */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 10 }}>
          
          {/* Grid background */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]">
            <defs>
              <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke={faceDetected ? '#00FF88' : '#00F2FE'} strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)"/>
          </svg>

          {/* Face oval */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 600">
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>

            {/* Outer oval */}
            <ellipse cx="200" cy="270" rx="110" ry="155"
              fill="none"
              stroke={faceDetected ? 'rgba(0, 255, 136, 0.6)' : 'rgba(0, 242, 254, 0.4)'}
              strokeWidth={faceDetected ? '2.5' : '1.5'}
              strokeDasharray={phase === 'detecting' ? '10 5' : 'none'}
              filter="url(#glow)"
            >
              {phase === 'detecting' && (
                <animate attributeName="stroke-dashoffset" from="0" to="-30" dur="1s" repeatCount="indefinite"/>
              )}
            </ellipse>

            {/* Inner oval */}
            <ellipse cx="200" cy="270" rx="104" ry="149"
              fill="none"
              stroke={faceDetected ? 'rgba(0, 255, 136, 0.2)' : 'rgba(0, 242, 254, 0.15)'}
              strokeWidth="1"
              strokeDasharray="4 4"
            >
              <animate attributeName="stroke-dashoffset" from="0" to="16" dur="2s" repeatCount="indefinite"/>
            </ellipse>

            {/* Eyebrow guides */}
            <path d="M 130 220 Q 150 200 175 210" fill="none" stroke="rgba(216, 164, 153, 0.5)" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M 270 220 Q 250 200 225 210" fill="none" stroke="rgba(216, 164, 153, 0.5)" strokeWidth="2.5" strokeLinecap="round"/>

            {/* Eye guides */}
            <ellipse cx="165" cy="255" rx="22" ry="10" fill="none" stroke="rgba(0, 242, 254, 0.4)" strokeWidth="1.5"/>
            <ellipse cx="235" cy="255" rx="22" ry="10" fill="none" stroke="rgba(0, 242, 254, 0.4)" strokeWidth="1.5"/>
            <circle cx="165" cy="255" r="4" fill="rgba(0, 242, 254, 0.3)"/>
            <circle cx="235" cy="255" r="4" fill="rgba(0, 242, 254, 0.3)"/>

            {/* Nose guide */}
            <line x1="200" y1="240" x2="200" y2="290" stroke="rgba(0, 242, 254, 0.2)" strokeWidth="1" strokeDasharray="3 2"/>
            <circle cx="200" cy="295" r="5" fill="none" stroke="rgba(216, 164, 153, 0.3)" strokeWidth="1"/>

            {/* Mouth guide */}
            <path d="M 175 330 Q 200 320 225 330" fill="none" stroke="rgba(216, 164, 153, 0.3)" strokeWidth="1.5"/>
            <path d="M 175 330 Q 200 345 225 330" fill="none" stroke="rgba(216, 164, 153, 0.2)" strokeWidth="1"/>

            {/* Corner brackets */}
            <path d="M 50 80 L 50 60 L 70 60" fill="none" stroke={faceDetected ? 'rgba(0, 255, 136, 0.5)' : 'rgba(0, 242, 254, 0.4)'} strokeWidth="2" strokeLinecap="round"/>
            <path d="M 350 80 L 350 60 L 330 60" fill="none" stroke={faceDetected ? 'rgba(0, 255, 136, 0.5)' : 'rgba(0, 242, 254, 0.4)'} strokeWidth="2" strokeLinecap="round"/>
            <path d="M 50 520 L 50 540 L 70 540" fill="none" stroke={faceDetected ? 'rgba(0, 255, 136, 0.5)' : 'rgba(0, 242, 254, 0.4)'} strokeWidth="2" strokeLinecap="round"/>
            <path d="M 350 520 L 350 540 L 330 540" fill="none" stroke={faceDetected ? 'rgba(0, 255, 136, 0.5)' : 'rgba(0, 242, 254, 0.4)'} strokeWidth="2" strokeLinecap="round"/>

            {/* Landmark dots */}
            {[
              { x: 130, y: 220 }, { x: 150, y: 205 }, { x: 175, y: 210 },
              { x: 270, y: 220 }, { x: 250, y: 205 }, { x: 225, y: 210 },
              { x: 165, y: 245 }, { x: 165, y: 265 }, { x: 143, y: 255 }, { x: 187, y: 255 },
              { x: 235, y: 245 }, { x: 235, y: 265 }, { x: 213, y: 255 }, { x: 257, y: 255 },
              { x: 200, y: 295 },
              { x: 175, y: 330 }, { x: 200, y: 325 }, { x: 225, y: 330 },
            ].map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r="2"
                fill={i < 6 ? '#D8A499' : '#00F2FE'}
                opacity={faceDetected ? '0.8' : '0.4'}
              >
                <animate attributeName="opacity" values={faceDetected ? '0.6;1;0.6' : '0.2;0.5;0.2'} dur="2s" repeatCount="indefinite" begin={`${i * 0.1}s`}/>
              </circle>
            ))}

            {/* Scanning laser */}
            {phase === 'scanning' && (
              <>
                <line x1="60" y1={laserY * 5.4 + 30} x2="340" y2={laserY * 5.4 + 30}
                  stroke="rgba(0, 242, 254, 0.8)" strokeWidth="2" filter="url(#glow)"
                />
                <rect x="60" y={laserY * 5.4 + 10} width="280" height="40" fill="url(#laserGrad)" opacity="0.3"/>
                <defs>
                  <linearGradient id="laserGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00F2FE" stopOpacity="0"/>
                    <stop offset="50%" stopColor="#00F2FE" stopOpacity="0.3"/>
                    <stop offset="100%" stopColor="#00F2FE" stopOpacity="0"/>
                  </linearGradient>
                </defs>
              </>
            )}

            {/* Measurement lines (when completed) */}
            {phase === 'completed' && (
              <>
                <line x1="150" y1="205" x2="250" y2="205" stroke="rgba(216, 164, 153, 0.5)" strokeWidth="1" strokeDasharray="3 2"/>
                <text x="200" y="198" fill="#D8A499" fontSize="10" textAnchor="middle" fontFamily="monospace">24.1mm</text>
                <text x="150" y="195" fill="rgba(0, 242, 254, 0.6)" fontSize="9" textAnchor="middle" fontFamily="monospace">52.3mm</text>
                <text x="250" y="195" fill="rgba(0, 242, 254, 0.6)" fontSize="9" textAnchor="middle" fontFamily="monospace">51.8mm</text>
              </>
            )}
          </svg>

          {/* Detection labels */}
          {faceDetected && (
            <>
              <div className="absolute top-[32%] left-[10%] px-2 py-1 rounded-full bg-black/60 border border-roseGold/30 text-[9px] font-mono text-roseGold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"/> SOURCIL G
              </div>
              <div className="absolute top-[32%] right-[10%] px-2 py-1 rounded-full bg-black/60 border border-roseGold/30 text-[9px] font-mono text-roseGold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"/> SOURCIL D
              </div>
              <div className="absolute top-[40%] left-[18%] px-2 py-1 rounded-full bg-black/60 border border-biometric-cyan/30 text-[9px] font-mono text-biometric-cyan flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"/> OEIL G
              </div>
              <div className="absolute top-[40%] right-[18%] px-2 py-1 rounded-full bg-black/60 border border-biometric-cyan/30 text-[9px] font-mono text-biometric-cyan flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"/> OEIL D
              </div>
              <div className="absolute top-[48%] left-1/2 -translate-x-1/2 px-2 py-1 rounded-full bg-black/60 border border-biometric-cyan/30 text-[9px] font-mono text-biometric-cyan flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"/> NEZ
              </div>
              <div className="absolute top-[56%] left-1/2 -translate-x-1/2 px-2 py-1 rounded-full bg-black/60 border border-roseGold/30 text-[9px] font-mono text-roseGold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"/> BOUCHE
              </div>
            </>
          )}

          {/* HUD Top */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-[11px] font-mono bg-black/60 backdrop-blur-md p-3 rounded-xl border border-obsidian-border">
            <span className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${phase === 'completed' ? 'bg-emerald-400' : faceDetected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400 animate-pulse'}`}/>
              <span className={faceDetected ? 'text-emerald-400' : 'text-amber-400'}>
                {phase === 'completed' ? 'TERMINÉ' : faceDetected ? 'DÉTECTÉ' : 'RECHERCHE'}
              </span>
            </span>
            <span className="flex items-center gap-2 text-biometric-cyan">
              <Crosshair className="w-3 h-3"/> 468 POINTS
            </span>
          </div>

          {/* Progress bar */}
          <div className="absolute bottom-4 left-4 right-4 space-y-2 bg-black/60 backdrop-blur-md p-3 rounded-2xl border border-obsidian-border">
            <div className="flex items-center justify-between text-xs font-mono text-gray-300">
              <span>PROGRESSION</span>
              <span className="text-roseGold font-bold">{progress}%</span>
            </div>
            <div className="w-full h-2.5 bg-obsidian rounded-full overflow-hidden border border-obsidian-border">
              <div className="h-full bg-gradient-to-r from-biometric-cyan via-roseGold to-emerald-400 transition-all duration-300" style={{ width: `${progress}%` }}/>
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className={progress >= 0 ? 'text-emerald-400' : 'text-gray-600'}>● Face</span>
              <span className={progress >= 33 ? 'text-biometric-cyan' : 'text-gray-600'}>● Gauche</span>
              <span className={progress >= 66 ? 'text-biometric-cyan' : 'text-gray-600'}>● Droite</span>
              <span className={progress >= 100 ? 'text-emerald-400' : 'text-gray-600'}>● Terminé</span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          ACTION BUTTONS
          ═══════════════════════════════════════════════════════════════ */}
      <div className="mt-8 space-y-4">
        
        {phase === 'positioned' && (
          <button onClick={startScan}
            className="group relative w-full py-5 rounded-2xl bg-gradient-to-r from-roseGold-dark via-roseGold to-roseGold-metallic text-obsidian font-bold text-base shadow-rose-glow hover:shadow-[0_0_60px_rgba(216,164,153,0.4)] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"/>
            <Zap className="w-6 h-6 relative z-10"/>
            <span className="relative z-10">Lancer le Scan Biométrique</span>
            <Sparkles className="w-5 h-5 relative z-10 animate-pulse"/>
          </button>
        )}

        {phase === 'scanning' && (
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-biometric-cyan/10 border border-biometric-cyan/30 text-biometric-cyan">
              <Scan className="w-5 h-5 animate-spin"/>
              <span className="font-mono text-sm">Scan {currentAngle.toUpperCase()}... {progress}%</span>
            </div>
          </div>
        )}

        {phase === 'completed' && (
          <button onClick={handleFinish}
            className="w-full py-5 rounded-2xl bg-gradient-to-r from-roseGold-dark via-roseGold to-roseGold-metallic text-obsidian font-bold text-base shadow-rose-glow hover:shadow-[0_0_60px_rgba(216,164,153,0.4)] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3"
          >
            <CheckCircle2 className="w-6 h-6"/>
            <span>Valider et Personnaliser mon Style 3D</span>
            <ChevronRight className="w-5 h-5"/>
          </button>
        )}

        {(phase === 'idle' || phase === 'detecting') && !cameraActive && (
          <button onClick={runSimulation}
            className="w-full py-5 rounded-2xl bg-gradient-to-r from-roseGold-dark via-roseGold to-roseGold-metallic text-obsidian font-bold text-base shadow-rose-glow transition-all flex items-center justify-center gap-3"
          >
            <Zap className="w-6 h-6"/>
            <span>Scanner IA Express (sans caméra)</span>
          </button>
        )}

        {phase !== 'idle' && phase !== 'detecting' && (
          <button onClick={handleReset}
            className="w-full py-3 rounded-xl bg-obsidian border border-obsidian-border text-gray-400 text-xs font-medium hover:bg-obsidian-light hover:text-white transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5"/> Recommencer
          </button>
        )}
      </div>

      {/* BIOMETRIC RESULTS */}
      {phase === 'completed' && (
        <div className="mt-8 p-6 rounded-3xl bg-obsidian-card border border-roseGold/30 space-y-4 animate-fade-in shadow-rose-glow">
          <div className="flex items-center justify-between border-b border-obsidian-border pb-3">
            <h3 className="font-serif font-bold text-lg text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400"/> Rapport Biométrique
            </h3>
            <span className="text-xs font-mono text-roseGold px-3 py-1 rounded-full bg-roseGold/10 border border-roseGold/20">0.1mm</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-mono">
            <div className="p-4 rounded-xl bg-obsidian border border-obsidian-border">
              <p className="text-[10px] text-gray-400 mb-1">Inter-Sourcils</p>
              <p className="text-lg font-bold text-roseGold">{biometrics.interEyebrowGapMm} mm</p>
            </div>
            <div className="p-4 rounded-xl bg-obsidian border border-obsidian-border">
              <p className="text-[10px] text-gray-400 mb-1">Longueur</p>
              <p className="text-lg font-bold text-roseGold">{biometrics.leftEyebrowLengthMm} mm</p>
            </div>
            <div className="p-4 rounded-xl bg-obsidian border border-obsidian-border">
              <p className="text-[10px] text-gray-400 mb-1">Arcade</p>
              <p className="text-lg font-bold text-roseGold">{biometrics.leftArchHeightMm} mm</p>
            </div>
            <div className="p-4 rounded-xl bg-obsidian border border-obsidian-border">
              <p className="text-[10px] text-gray-400 mb-1">Symétrie</p>
              <p className="text-lg font-bold text-emerald-400">{biometrics.facialSymmetryIndex}%</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 text-center">
        <button onClick={onBack} className="text-sm text-gray-400 hover:text-roseGold underline transition-colors font-medium">
          ← Modifier mes coordonnées
        </button>
      </div>
    </div>
  );
};
