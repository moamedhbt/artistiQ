'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Sparkles, ArrowRight, ShieldCheck, Cpu, Box } from 'lucide-react';
import { createEyebrowStencil3DGeometry } from '@/lib/stlGenerator';
import { DEFAULT_CUSTOM_PARAMS, DEFAULT_BIOMETRICS } from '@/lib/biometrics';

interface MainHeroSectionProps {
  onOrderClick: () => void;
  onExploreProcess: () => void;
}

export const MainHeroSection: React.FC<MainHeroSectionProps> = ({
  onOrderClick,
  onExploreProcess,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Floating 3D Stamp in Hero Section
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

    const dirLight1 = new THREE.DirectionalLight(0xc89388, 2.5);
    dirLight1.position.set(80, 80, 80);
    scene.add(dirLight1);

    const { stencilMesh } = createEyebrowStencil3DGeometry(DEFAULT_CUSTOM_PARAMS, DEFAULT_BIOMETRICS);

    const goldMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xc89388,
      roughness: 0.2,
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
    <section className="relative py-12 lg:py-20 bg-pearl overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="bg-pearl-card border border-pearl-border rounded-3xl p-8 lg:p-12 shadow-luxury grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-roseGold-light border border-roseGold/20 text-roseGold text-xs font-serif italic">
              <Sparkles className="w-3.5 h-3.5 text-roseGold" />
              <span>artistiQ • Haute Beauté Individualisée</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-5xl font-serif font-bold tracking-tight text-charcoal leading-[1.18]">
              Votre sourcil naturel, <br />
              <span className="italic text-roseGold font-normal">
                réinventé sur-mesure.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-charcoal-muted font-serif italic leading-relaxed max-w-xl">
              Grâce à une analyse haute précision de la morphologie de votre visage, nous cartographions la courbure unique de votre arcade pour façonner votre applicateur individuel en silicone ultra-doux. Un tracé identique et symétrique en 5 secondes.
            </p>

            {/* Action CTA */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={onOrderClick}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-charcoal-button hover:bg-charcoal-buttonHover text-white font-serif tracking-widest text-xs uppercase font-bold shadow-button-shadow border border-roseGold/30 transition-all flex items-center justify-center gap-3 group"
              >
                <span>Commander votre pochoir personnalisé</span>
                <ArrowRight className="w-4 h-4 text-roseGold group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onExploreProcess}
                className="w-full sm:w-auto px-6 py-4 rounded-xl bg-pearl border border-pearl-border text-charcoal font-serif tracking-widest text-xs uppercase font-semibold hover:bg-pearl-dark transition-all"
              >
                Comment ça marche ?
              </button>
            </div>

            {/* Badges */}
            <div className="pt-4 border-t border-pearl-border flex flex-wrap items-center gap-6 text-xs text-charcoal-muted font-serif italic">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-roseGold" /> Silicone Cosmétique Ultra-Doux
              </span>
              <span className="flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-roseGold" /> Cartographie Biométrique
              </span>
              <span className="flex items-center gap-1.5">
                <Box className="w-4 h-4 text-roseGold" /> Application 5 Sec
              </span>
            </div>

          </div>

          {/* Right 3D Model Viewport */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden bg-pearl border border-pearl-border p-6 shadow-luxury text-center space-y-4">
              
              <div className="flex items-center justify-between border-b border-pearl-border pb-3 text-xs font-serif italic text-charcoal">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-roseGold" /> Modélisation 3D du Tampon
                </span>
                <span className="text-roseGold font-semibold">Interactif</span>
              </div>

              {/* 3D Canvas */}
              <div className="relative aspect-[4/3] rounded-2xl bg-pearl-card border border-pearl-border overflow-hidden">
                <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
              </div>

              <div className="text-xs font-serif italic text-charcoal-muted pt-1">
                Finition Or Rose Satiné & Verre Dépoli
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
