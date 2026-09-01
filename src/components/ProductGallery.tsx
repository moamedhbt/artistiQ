'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Sparkles, Box, CheckCircle2, RotateCcw, Heart } from 'lucide-react';
import { DEFAULT_CUSTOM_PARAMS, DEFAULT_BIOMETRICS } from '@/lib/biometrics';
import { createEyebrowStencil3DGeometry } from '@/lib/stlGenerator';

export const ProductGallery: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [activeMaterial, setActiveMaterial] = useState<'roseGold' | 'frosted' | 'gold'>('roseGold');

  // Interactive 3D Product Canvas in Showcase
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth || 400;
    const height = mountRef.current.clientHeight || 300;

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

    const dirLight = new THREE.DirectionalLight(0xd8a499, 2.5);
    dirLight.position.set(80, 80, 80);
    scene.add(dirLight);

    const { stencilMesh } = createEyebrowStencil3DGeometry(DEFAULT_CUSTOM_PARAMS, DEFAULT_BIOMETRICS);

    const materials = {
      roseGold: new THREE.MeshStandardMaterial({ color: 0xd8a499, metalness: 0.8, roughness: 0.2 }),
      frosted: new THREE.MeshPhysicalMaterial({ color: 0xf8e8e3, roughness: 0.1, transmission: 0.3, transparent: true }),
      gold: new THREE.MeshStandardMaterial({ color: 0xe5c9a5, metalness: 0.9, roughness: 0.15 }),
    };

    const mesh = new THREE.Mesh(stencilMesh, materials[activeMaterial]);
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
        mesh.rotation.y += 0.005;
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
  }, [activeMaterial]);

  return (
    <section className="py-20 bg-pearl relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center space-y-3 mb-16">
          <span className="text-xs font-serif italic tracking-widest text-roseGold uppercase px-3.5 py-1 rounded-full bg-roseGold-light border border-roseGold/20">
            La Collection Haute Précision
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-charcoal">
            L'Excellence du Tampon Sur-Mesure
          </h2>
          <p className="text-sm text-charcoal-muted font-serif italic max-w-xl mx-auto">
            Explorez notre création d'exception : un alliage de silicone médical souple, de verre dépoli et de finition Or Rose.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Interactive 3D Product Canvas Card */}
          <div className="lg:col-span-7">
            <div className="bg-pearl-card border border-pearl-border rounded-3xl p-6 shadow-soft-luxury space-y-4">
              <div className="flex items-center justify-between border-b border-pearl-border pb-3 text-xs font-serif italic text-charcoal">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-roseGold" /> Studio 3D Interactif
                </span>
                <span className="text-roseGold font-semibold">Faites pivoter avec la souris</span>
              </div>

              {/* 3D Viewport */}
              <div className="relative aspect-[4/3] rounded-2xl bg-pearl border border-pearl-border overflow-hidden">
                <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
              </div>

              {/* Finish Selector */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-serif italic text-charcoal-muted">Finition Sélectionnée :</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveMaterial('roseGold')}
                    className={`px-3 py-1.5 rounded-full text-xs font-serif italic transition-all ${
                      activeMaterial === 'roseGold'
                        ? 'bg-roseGold text-white shadow-sm font-semibold'
                        : 'bg-pearl border border-pearl-border text-charcoal hover:border-roseGold'
                    }`}
                  >
                    Or Rose Satiné
                  </button>
                  <button
                    onClick={() => setActiveMaterial('frosted')}
                    className={`px-3 py-1.5 rounded-full text-xs font-serif italic transition-all ${
                      activeMaterial === 'frosted'
                        ? 'bg-roseGold text-white shadow-sm font-semibold'
                        : 'bg-pearl border border-pearl-border text-charcoal hover:border-roseGold'
                    }`}
                  >
                    Verre Dépoli
                  </button>
                  <button
                    onClick={() => setActiveMaterial('gold')}
                    className={`px-3 py-1.5 rounded-full text-xs font-serif italic transition-all ${
                      activeMaterial === 'gold'
                        ? 'bg-roseGold text-white shadow-sm font-semibold'
                        : 'bg-pearl border border-pearl-border text-charcoal hover:border-roseGold'
                    }`}
                  >
                    Or Champagne
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Product Feature Highlights */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="p-6 rounded-3xl bg-pearl-card border border-pearl-border shadow-soft-luxury space-y-4">
              <h3 className="font-serif font-bold text-xl text-charcoal">
                Ce Que Contient Votre Coffret artistiQ :
              </h3>

              <div className="space-y-3 text-xs text-charcoal font-sans">
                <div className="p-3.5 rounded-2xl bg-pearl border border-pearl-border flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-roseGold shrink-0 mt-0.5" />
                  <div>
                    <p className="font-serif font-bold text-charcoal">Votre Tampon Individuel Sur-Mesure</p>
                    <p className="text-charcoal-muted text-[11px] font-serif italic">Moulé selon la courbure exacte de votre arcade.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-pearl border border-pearl-border flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-roseGold shrink-0 mt-0.5" />
                  <div>
                    <p className="font-serif font-bold text-charcoal">L'Applicateur Ergonomique de Précision</p>
                    <p className="text-charcoal-muted text-[11px] font-serif italic">Prise en main confortable pour une application en 5 secondes.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-pearl border border-pearl-border flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-roseGold shrink-0 mt-0.5" />
                  <div>
                    <p className="font-serif font-bold text-charcoal">Le Boîtier de Protection Haute Couture</p>
                    <p className="text-charcoal-muted text-[11px] font-serif italic">Pour ranger et conserver votre tampon à l'abri de la poussière.</p>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
