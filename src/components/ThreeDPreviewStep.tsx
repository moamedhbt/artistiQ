'use client';

import React, { useEffect, useRef, useState } from 'react';
import { EyebrowCustomParams, BiometricMeasurements, ClientInfo } from '@/types';
import { createEyebrowStencil3DGeometry, exportBufferGeometryToBinarySTL, downloadSTLFile } from '@/lib/stlGenerator';
import * as THREE from 'three';
import { Box, Download, RotateCcw, CheckCircle2, ArrowRight, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';

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

  // Three.js Scene Setup
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth || 500;
    const height = mountRef.current.clientHeight || 400;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0B0A0F');

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 160);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xd4af37, 2.5); // Gold light
    dirLight1.position.set(100, 100, 100);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x00f2fe, 1.5); // Cyan biometric light
    dirLight2.position.set(-100, -100, -100);
    scene.add(dirLight2);

    // Create 3D Geometries
    const { stencilMesh } = createEyebrowStencil3DGeometry(customParams, biometrics);

    // Gold Metallic Material for Plastic Base
    const goldMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.8,
      roughness: 0.2,
      wireframe: false,
    });

    const mesh = new THREE.Mesh(stencilMesh, goldMaterial);
    scene.add(mesh);

    // Wireframe Overlay for Biometric tech look
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
    });
    const wireMesh = new THREE.Mesh(stencilMesh, wireframeMat);
    scene.add(wireMesh);

    // Rotation Loop & Drag Rotation
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      mesh.rotation.y += deltaX * 0.01;
      mesh.rotation.x += deltaY * 0.01;
      wireMesh.rotation.y += deltaX * 0.01;
      wireMesh.rotation.x += deltaY * 0.01;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // Render Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!isDragging) {
        mesh.rotation.y += 0.005;
        wireMesh.rotation.y += 0.005;
      }
      renderer.render(scene, camera);
    };
    animate();

    // Handle Resize
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      dom.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [customParams, biometrics]);

  // Handle STL Download
  const handleDownloadSTL = () => {
    setIsGeneratingSTL(true);
    try {
      const { stencilMesh } = createEyebrowStencil3DGeometry(customParams, biometrics);
      const buffer = exportBufferGeometryToBinarySTL(stencilMesh);
      const filename = `artistiQ_moule_${clientInfo.fullName.replace(/\s+/g, '_')}_${customParams.styleId}.stl`;
      downloadSTLFile(buffer, filename);
      setStlDownloaded(true);
    } catch (e) {
      console.error('Error exporting STL:', e);
    } finally {
      setIsGeneratingSTL(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header — Obsidian Dark Theme */}
      <div className="text-center space-y-2 mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-roseGold/10 border border-roseGold/30 text-roseGold text-xs font-mono">
          <Box className="w-4 h-4" />
          Étape 4 sur 4 • Modèle 3D Généré pour Impression & Moule
        </div>
        <h2 className="text-3xl font-serif font-bold text-white">
          Aperçu du Pochoir 3D & Moule Silicone
        </h2>
        <p className="text-sm text-gray-200 font-medium max-w-xl mx-auto">
          Faites pivoter la pièce avec votre souris ou votre doigt. Le fichier STL est prêt pour votre imprimante 3D et le coulage de résine/silicone.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Interactive 3D Canvas Container */}
        <div className="lg:col-span-7">
          <div className="relative aspect-[4/3] rounded-3xl bg-obsidian-card border border-roseGold/40 shadow-rose-glow overflow-hidden">
            <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

            {/* Canvas Overlay Info */}
            <div className="absolute top-4 left-4 text-[10px] font-mono text-roseGold bg-obsidian/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-roseGold/20 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-roseGold animate-spin-slow" />
              <span>INTERACTIF • FAITES TOURNER LE MODÈLE</span>
            </div>

            <div className="absolute bottom-4 right-4 text-[11px] font-mono text-gray-300 bg-obsidian/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-obsidian-border">
              Épaisseur: {customParams.stencilThicknessMm}mm • Moule: {customParams.moldDepthMm}mm
            </div>
          </div>
        </div>

        {/* Right Action & Order Summary Card — Obsidian Dark */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-obsidian-card border border-obsidian-border space-y-5 shadow-card-glow">
            
            <h3 className="font-serif font-bold text-lg text-white border-b border-obsidian-border pb-3">
              Récapitulatif de Confection
            </h3>

            {/* Client Info Brief */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-gray-200">
                <span>Destinataire:</span>
                <span className="font-bold text-white">{clientInfo.fullName}</span>
              </div>
              <div className="flex justify-between text-gray-200">
                <span>Ville de Livraison:</span>
                <span className="font-bold text-white">{clientInfo.city}</span>
              </div>
              <div className="flex justify-between text-gray-200">
                <span>Style Sélectionné:</span>
                <span className="font-bold text-roseGold uppercase">{customParams.styleId}</span>
              </div>
            </div>

            {/* Production Specs */}
            <div className="p-4 rounded-2xl bg-obsidian border border-obsidian-border space-y-2 text-xs font-mono">
              <div className="flex justify-between text-gray-300">
                <span>Matière Finale:</span>
                <span className="text-emerald-400 font-bold">Silicone Souple Pharmacie</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Procédé:</span>
                <span className="text-roseGold font-bold">Impression 3D + Moule Resine</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Paiement:</span>
                <span className="text-white font-bold">À la livraison (Cash)</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              {/* Optional STL Download Button */}
              <button
                onClick={handleDownloadSTL}
                disabled={isGeneratingSTL}
                className="w-full py-3.5 rounded-xl bg-obsidian border border-roseGold/40 text-roseGold text-xs font-mono font-bold hover:bg-roseGold/10 transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>{stlDownloaded ? 'Fichier 3D (.STL) Téléchargé !' : 'Télécharger le Fichier 3D (.STL)'}</span>
              </button>

              {/* Confirm Order — Grand Bouton Or Rose Lumineux */}
              <button
                onClick={onConfirmOrder}
                className="w-full py-5 rounded-2xl bg-gradient-to-r from-roseGold-dark via-roseGold to-roseGold-metallic text-obsidian font-bold text-base shadow-rose-glow hover:shadow-[0_0_50px_rgba(216,164,153,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <span>Confirmer Ma Commande Sur-Mesure</span>
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
