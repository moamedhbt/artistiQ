'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Camera, ArrowRight, ShieldCheck, Cpu, Box, Sparkles } from 'lucide-react';
import { createEyebrowStencil3DGeometry } from '@/lib/stlGenerator';
import { DEFAULT_CUSTOM_PARAMS, DEFAULT_BIOMETRICS } from '@/lib/biometrics';

interface MainHeroSectionProps {
  onStartScan: () => void;
}

export const MainHeroSection: React.FC<MainHeroSectionProps> = ({ onStartScan }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Floating 3D Stencil Model Canvas in Dark Luxury Lighting with Neon/Cyan Grid Overlays
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth || 400;
    const height = mountRef.current.clientHeight || 350;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0F0E13');

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 150);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // Dark Luxury Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xd8a499, 2.5); // Rose Gold Light
    dirLight1.position.set(80, 80, 80);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x00f2fe, 1.5); // Cyan AI Detection Light
    dirLight2.position.set(-80, -80, -80);
    scene.add(dirLight2);

    const { stencilMesh } = createEyebrowStencil3DGeometry(DEFAULT_CUSTOM_PARAMS, DEFAULT_BIOMETRICS);

    // Rose Gold Metallic Material
    const goldMaterial = new THREE.MeshStandardMaterial({
      color: 0xd8a499,
      metalness: 0.8,
      roughness: 0.2,
      wireframe: false,
    });

    const mesh = new THREE.Mesh(stencilMesh, goldMaterial);
    scene.add(mesh);

    // Subtle Neon Cyan Wireframe Mesh Overlay
    const cyanWireMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      wireframe: true,
      transparent: true,
      opacity: 0.18,
    });
    const wireMesh = new THREE.Mesh(stencilMesh, cyanWireMat);
    scene.add(wireMesh);

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

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!isDragging) {
        mesh.rotation.y += 0.006;
        wireMesh.rotation.y += 0.006;
      }
      renderer.render(scene, camera);
    };
    animate();

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
  }, []);

  return (
    <section id="hero" className="relative pt-28 pb-16 lg:pt-36 lg:pb-24 bg-obsidian overflow-hidden">
      
      {/* Background Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-roseGold/10 via-neonCyan/5 to-transparent blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="bg-obsidian-card border border-obsidian-border rounded-3xl p-8 lg:p-14 shadow-dark-luxury grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text: Section 1 Hook Spec */}
          <div className="lg:col-span-7 space-y-8 text-left">
            
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-obsidian border border-roseGold/30 text-roseGold text-xs font-serif italic shadow-rose-glow">
              <Sparkles className="w-3.5 h-3.5 text-roseGold animate-spin-slow" />
              <span>ARTISTIQ • Replicated Brow Technology</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-white leading-[1.15]">
              L'Avenir du Regard. <br />
              <span className="italic text-roseGold font-normal">
                Sculpté par la Science, Sur-Mesure pour Vous.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-gray-300 font-serif italic leading-relaxed max-w-xl">
              Une précision algorithmique absolue. Nous transformons la morphologie unique de vos sourcils en un outil d'application 3D exclusif.
            </p>

            {/* CTA Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={onStartScan}
                className="w-full sm:w-auto px-9 py-4 rounded-xl bg-gradient-to-r from-roseGold-dark via-roseGold to-roseGold-metallic text-obsidian font-serif tracking-widest text-xs uppercase font-bold shadow-rose-glow hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
              >
                <Camera className="w-4 h-4 text-obsidian" />
                <span>Scanner Mon Visage</span>
                <ArrowRight className="w-4 h-4 text-obsidian group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Badges */}
            <div className="pt-4 border-t border-obsidian-border flex flex-wrap items-center gap-6 text-xs text-gray-400 font-serif italic">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-roseGold" /> Cartographie Biométrique
              </span>
              <span className="flex items-center gap-1.5">
                <Box className="w-4 h-4 text-roseGold" /> Maillage 3D Paramétrique
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-roseGold" /> Silicone Médical Souple
              </span>
            </div>

          </div>

          {/* Right 3D Viewport */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden bg-obsidian border border-obsidian-border p-6 shadow-dark-luxury text-center space-y-4">
              
              <div className="flex items-center justify-between border-b border-obsidian-border pb-3 text-xs font-serif italic text-roseGold">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-roseGold" /> Rendu 3D avec Maillage AI
                </span>
                <span className="text-neonCyan text-[11px] font-mono">NEON GRID ON</span>
              </div>

              {/* 3D Canvas */}
              <div className="relative aspect-[4/3] rounded-2xl bg-obsidian-card border border-obsidian-border overflow-hidden">
                <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
              </div>

              <div className="text-xs font-serif italic text-gray-400 pt-1">
                Faites pivoter avec votre doigt ou la souris
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
