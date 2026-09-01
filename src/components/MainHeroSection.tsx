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

  // Photorealistic 3D Eyebrow Stamp Canvas
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth || 400;
    const height = mountRef.current.clientHeight || 350;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0B0A0F');

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 5, 95);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xd8a499, 3.0); // Rose Gold Key Light
    dirLight1.position.set(60, 80, 80);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xe6c687, 1.5); // Champagne Fill Light
    dirLight2.position.set(-60, -50, 60);
    scene.add(dirLight2);

    const dirLight3 = new THREE.DirectionalLight(0x00f2fe, 1.0); // Subtle Rim Light
    dirLight3.position.set(0, -80, -60);
    scene.add(dirLight3);

    // Rose Gold Dust Particles
    const particleCount = 80;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 160;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0xd8a499,
      size: 1.5,
      transparent: true,
      opacity: 0.5,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    const { stencilMesh } = createEyebrowStencil3DGeometry(DEFAULT_CUSTOM_PARAMS, DEFAULT_BIOMETRICS);

    // Polished Rose-Gold Metallic Material
    const goldMaterial = new THREE.MeshStandardMaterial({
      color: 0xd8a499,
      metalness: 0.85,
      roughness: 0.18,
    });

    const mesh = new THREE.Mesh(stencilMesh, goldMaterial);
    // Face the camera directly tilted slightly
    mesh.rotation.x = -0.15;
    mesh.rotation.y = 0.25;
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
        particles.rotation.y += 0.001;
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
      
      {/* Background Cyber-Luxury Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[950px] h-[550px] bg-gradient-to-b from-roseGold/10 via-neonCyan/5 to-transparent blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="bg-obsidian-card border border-obsidian-border rounded-3xl p-8 lg:p-14 shadow-cyber-luxury grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text */}
          <div className="lg:col-span-7 space-y-8 text-left">
            
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-obsidian border border-roseGold/30 text-roseGold text-xs font-serif italic shadow-rose-glow">
              <Sparkles className="w-3.5 h-3.5 text-roseGold animate-spin-slow" />
              <span>ARTISTIQ • Haute-Couture Beauty Tech</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-white leading-[1.15]">
              L'Avenir du Regard. <br />
              <span className="italic text-roseGold font-normal">
                Sculpté par l'IA, Façonné pour Vous.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-gray-300 font-serif italic leading-relaxed max-w-xl">
              Une fusion inédite entre la vision par ordinateur et la haute cosmétique. Nous révélons la géométrie pure de vos sourcils pour créer votre empreinte beauté unique.
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
                <Cpu className="w-4 h-4 text-roseGold" /> 70+ Points d'Ancrage AI
              </span>
              <span className="flex items-center gap-1.5">
                <Box className="w-4 h-4 text-roseGold" /> Fidélité Anatomique 1:1
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-roseGold" /> Silicone Médical Souple
              </span>
            </div>

          </div>

          {/* Right 3D Viewport */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden bg-obsidian border border-obsidian-border p-6 shadow-cyber-luxury text-center space-y-4">
              
              <div className="flex items-center justify-between border-b border-obsidian-border pb-3 text-xs font-serif italic text-roseGold">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-roseGold" /> Tampon Sur-Mesure 3D
                </span>
                <span className="text-roseGold font-mono text-[11px]">OR ROSE SATINÉ</span>
              </div>

              {/* 3D Canvas */}
              <div className="relative aspect-[4/3] rounded-2xl bg-obsidian-card border border-obsidian-border overflow-hidden">
                <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
              </div>

              <div className="text-xs font-serif italic text-gray-400 pt-1">
                Faites pivoter le tampon avec votre doigt ou la souris
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
