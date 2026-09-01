'use client';

import React, { useEffect, useRef, useState } from 'react';
import { EyebrowCustomParams, BiometricMeasurements, ClientInfo } from '@/types';
import { createEyebrowStencil3DGeometry, exportBufferGeometryToBinarySTL, downloadSTLFile } from '@/lib/stlGenerator';
import * as THREE from 'three';
import { Box, Download, CheckCircle2, ArrowRight, Sparkles, Layers } from 'lucide-react';

interface ThreeDPreviewStepProps {
  clientInfo: ClientInfo;
  biometrics: BiometricMeasurements;
  customParams: EyebrowCustomParams;
  onConfirmOrder: () => void;
  onBack: () => void;
}

export const ThreeDPreviewStep: React.FC<ThreeDPreviewStepProps> = ({
  clientInfo,
  biometrics,
  customParams,
  onConfirmOrder,
  onBack,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isGeneratingSTL, setIsGeneratingSTL] = useState(false);
  const [stlDownloaded, setStlDownloaded] = useState(false);
  const [viewMode, setViewMode] = useState<'stencil' | 'mold' | 'both'>('both');

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth || 500;
    const height = mountRef.current.clientHeight || 400;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0B0A0F');

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 20, 120);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xd4af37, 2);
    dirLight1.position.set(80, 80, 80);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x00f2fe, 1);
    dirLight2.position.set(-60, -40, 60);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xd4af37, 0.5, 200);
    pointLight.position.set(0, 50, 50);
    scene.add(pointLight);

    // Create geometries
    const { stencilMesh, moldMesh } = createEyebrowStencil3DGeometry(customParams, biometrics);

    // Stencil material (Rose Gold metallic)
    const stencilMaterial = new THREE.MeshStandardMaterial({
      color: 0xd8a499,
      metalness: 0.7,
      roughness: 0.25,
      side: THREE.DoubleSide,
    });

    const stencilObj = new THREE.Mesh(stencilMesh, stencilMaterial);
    stencilObj.castShadow = true;
    scene.add(stencilObj);

    // Wireframe overlay
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      wireframe: true,
      transparent: true,
      opacity: 0.08,
    });
    const wireObj = new THREE.Mesh(stencilMesh, wireMat);
    scene.add(wireObj);

    // Mold material (darker, matte)
    const moldMaterial = new THREE.MeshStandardMaterial({
      color: 0x888888,
      metalness: 0.3,
      roughness: 0.7,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide,
    });

    const moldObj = new THREE.Mesh(moldMesh, moldMaterial);
    moldObj.castShadow = true;
    scene.add(moldObj);

    // Grid helper
    const gridHelper = new THREE.GridHelper(200, 20, 0x1a1a2e, 0x1a1a2e);
    gridHelper.position.y = -50;
    scene.add(gridHelper);

    // Drag rotation
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };

    const onPointerDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };
    const onPointerMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouse.x;
      const dy = e.clientY - prevMouse.y;
      stencilObj.rotation.y += dx * 0.008;
      stencilObj.rotation.x += dy * 0.008;
      wireObj.rotation.copy(stencilObj.rotation);
      moldObj.rotation.copy(stencilObj.rotation);
      prevMouse = { x: e.clientX, y: e.clientY };
    };
    const onPointerUp = () => { isDragging = false; };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    // Animation
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      if (!isDragging) {
        stencilObj.rotation.y += 0.003;
        wireObj.rotation.y += 0.003;
        moldObj.rotation.y += 0.003;
      }
      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const onResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(frameId);
      dom.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('resize', onResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [customParams, biometrics]);

  const handleDownloadSTL = () => {
    setIsGeneratingSTL(true);
    try {
      const { stencilMesh } = createEyebrowStencil3DGeometry(customParams, biometrics);
      const buffer = exportBufferGeometryToBinarySTL(stencilMesh);
      const filename = `artistiQ_moule_${clientInfo.fullName.replace(/\s+/g, '_')}_${customParams.styleId}.stl`;
      downloadSTLFile(buffer, filename);
      setStlDownloaded(true);
    } catch (e) {
      console.error('STL export error:', e);
    } finally {
      setIsGeneratingSTL(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="text-center space-y-2 mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-roseGold/10 border border-roseGold/30 text-roseGold text-xs font-mono">
          <Box className="w-4 h-4" />
          Étape 4 sur 4 • Moule Personnalisé Généré
        </div>
        <h2 className="text-3xl font-serif font-bold text-white">
          Votre Moule Sur-Mesure
        </h2>
        <p className="text-sm text-gray-200 font-medium max-w-xl mx-auto">
          Moule personnalisé basé sur vos mesures biométriques. Faites pivoter pour voir tous les détails.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* 3D Canvas */}
        <div className="lg:col-span-7">
          <div className="relative aspect-[4/3] rounded-3xl bg-obsidian-card border border-roseGold/40 shadow-rose-glow overflow-hidden">
            <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

            {/* Top overlay */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
              <div className="text-[10px] font-mono text-roseGold bg-obsidian/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-roseGold/20 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
                INTERACTIF • TOURNER AVEC LA SOURIS
              </div>
            </div>

            {/* Bottom specs */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <div className="text-[10px] font-mono text-gray-300 bg-obsidian/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-obsidian-border">
                Pochoir: {customParams.stencilThicknessMm}mm
              </div>
              <div className="text-[10px] font-mono text-gray-300 bg-obsidian/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-obsidian-border">
                Moule: {customParams.moldDepthMm}mm
              </div>
            </div>

            {/* Legend */}
            <div className="absolute bottom-14 left-4 flex items-center gap-4 text-[9px] font-mono">
              <span className="flex items-center gap-1.5 text-roseGold">
                <span className="w-3 h-2 rounded-sm bg-roseGold" />
                Pochoir
              </span>
              <span className="flex items-center gap-1.5 text-gray-400">
                <span className="w-3 h-2 rounded-sm bg-gray-500 opacity-50" />
                Moule
              </span>
              <span className="flex items-center gap-1.5 text-biometric-cyan">
                <span className="w-3 h-0.5 bg-biometric-cyan" />
                Wireframe
              </span>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-obsidian-card border border-obsidian-border space-y-5 shadow-card-glow">
            
            <h3 className="font-serif font-bold text-lg text-white border-b border-obsidian-border pb-3 flex items-center gap-2">
              <Layers className="w-5 h-5 text-roseGold" />
              Récapitulatif de Confection
            </h3>

            {/* Client Info */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-gray-200">
                <span>Destinataire:</span>
                <span className="font-bold text-white">{clientInfo.fullName}</span>
              </div>
              <div className="flex justify-between text-gray-200">
                <span>Ville:</span>
                <span className="font-bold text-white">{clientInfo.city}</span>
              </div>
              <div className="flex justify-between text-gray-200">
                <span>Style:</span>
                <span className="font-bold text-roseGold uppercase">{customParams.styleId}</span>
              </div>
            </div>

            {/* Biometric measurements */}
            <div className="p-4 rounded-2xl bg-obsidian border border-obsidian-border space-y-2 text-xs font-mono">
              <p className="text-[10px] text-gray-400 uppercase mb-2">Mesures Biométriques</p>
              <div className="flex justify-between text-gray-300">
                <span>Inter-sourcils:</span>
                <span className="text-roseGold font-bold">{biometrics.interEyebrowGapMm}mm</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Longueur:</span>
                <span className="text-roseGold font-bold">{biometrics.leftEyebrowLengthMm}mm</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Arcade:</span>
                <span className="text-roseGold font-bold">{biometrics.leftArchHeightMm}mm</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Symétrie:</span>
                <span className="text-emerald-400 font-bold">{biometrics.facialSymmetryIndex}%</span>
              </div>
            </div>

            {/* Production specs */}
            <div className="p-4 rounded-2xl bg-obsidian border border-obsidian-border space-y-2 text-xs font-mono">
              <p className="text-[10px] text-gray-400 uppercase mb-2">Production</p>
              <div className="flex justify-between text-gray-300">
                <span>Matière:</span>
                <span className="text-emerald-400 font-bold">Silicone Pharmacie</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Procédé:</span>
                <span className="text-roseGold font-bold">Impression 3D + Moule</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Paiement:</span>
                <span className="text-white font-bold">À la livraison</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handleDownloadSTL}
                disabled={isGeneratingSTL}
                className="w-full py-3.5 rounded-xl bg-obsidian border border-roseGold/40 text-roseGold text-xs font-mono font-bold hover:bg-roseGold/10 transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>{stlDownloaded ? 'STL Téléchargé !' : 'Télécharger le Fichier STL'}</span>
              </button>

              <button
                onClick={onConfirmOrder}
                className="w-full py-5 rounded-2xl bg-gradient-to-r from-roseGold-dark via-roseGold to-roseGold-metallic text-obsidian font-bold text-base shadow-rose-glow hover:shadow-[0_0_50px_rgba(216,164,153,0.4)] hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <span>Confirmer Ma Commande</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={onBack}
              className="text-xs text-gray-400 hover:text-white underline transition-colors block mx-auto text-center"
            >
              ← Modifier les dimensions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
