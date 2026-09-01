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

  // Floating 3D Stencil Model Canvas
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth || 400;
    const height = mountRef.current.clientHeight || 350;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#FAF8F6');

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 150);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xd8a499, 2.5);
    dirLight1.position.set(80, 80, 80);
    scene.add(dirLight1);

    const { stencilMesh } = createEyebrowStencil3DGeometry(DEFAULT_CUSTOM_PARAMS, DEFAULT_BIOMETRICS);

    const goldMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xd8a499,
      roughness: 0.15,
      metalness: 0.7,
      transmission: 0.2,
      transparent: true,
      clearcoat: 1.0,
    });

    const mesh = new THREE.Mesh(stencilMesh, goldMaterial);
    scene.add(mesh);

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
    <section className="relative pt-28 pb-16 lg:pt-36 lg:pb-24 bg-pearl overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="bg-pearl-card border border-pearl-border rounded-3xl p-8 lg:p-14 shadow-luxury grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hook Text */}
          <div className="lg:col-span-7 space-y-8 text-left">
            
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-roseGold-light border border-roseGold/20 text-roseGold text-xs font-serif italic">
              <Sparkles className="w-3.5 h-3.5 text-roseGold" />
              <span>ARTISTIQ • Replicated Brow Technology</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-charcoal leading-[1.15]">
              L'Avenir du Regard. <br />
              <span className="italic text-roseGold font-normal">
                Sculpté par la Science, Sur-Mesure pour Vous.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-charcoal-muted font-serif italic leading-relaxed max-w-xl">
              Une précision algorithmique absolue. Nous transformons la morphologie unique de vos sourcils en un outil d'application 3D exclusif.
            </p>

            {/* CTA Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={onStartScan}
                className="w-full sm:w-auto px-9 py-4 rounded-xl bg-charcoal-button hover:bg-charcoal-buttonHover text-white font-serif tracking-widest text-xs uppercase font-bold shadow-button-shadow border border-roseGold/30 transition-all flex items-center justify-center gap-3 group"
              >
                <Camera className="w-4 h-4 text-roseGold" />
                <span>Scanner Mon Visage</span>
                <ArrowRight className="w-4 h-4 text-roseGold group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Badges */}
            <div className="pt-4 border-t border-pearl-border flex flex-wrap items-center gap-6 text-xs text-charcoal-muted font-serif italic">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-roseGold" /> Cartographie Biométrique
              </span>
              <span className="flex items-center gap-1.5">
                <Box className="w-4 h-4 text-roseGold" /> Modélisation 1:1
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-roseGold" /> Silicone Médical Souple
              </span>
            </div>

          </div>

          {/* Right 3D Interactive Viewport */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden bg-pearl border border-pearl-border p-6 shadow-luxury text-center space-y-4">
              
              <div className="flex items-center justify-between border-b border-pearl-border pb-3 text-xs font-serif italic text-charcoal">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-roseGold" /> Rendu 3D en Direct
                </span>
                <span className="text-roseGold font-semibold">Or Rose & Verre Dépoli</span>
              </div>

              {/* 3D Canvas */}
              <div className="relative aspect-[4/3] rounded-2xl bg-pearl-card border border-pearl-border overflow-hidden">
                <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
              </div>

              <div className="text-xs font-serif italic text-charcoal-muted pt-1">
                Faites pivoter avec votre doigt ou la souris
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
