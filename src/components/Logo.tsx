'use client';

import React from 'react';

interface LogoProps {
  className?: string;
  showSubtitle?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', showSubtitle = true }) => {
  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      
      {/* SVG Emblem matching official ARTISTIQ image */}
      <svg
        viewBox="0 0 400 110"
        className="w-full max-w-[280px] h-auto drop-shadow-sm"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="roseGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E6C687" />
            <stop offset="40%" stopColor="#D8A499" />
            <stop offset="80%" stopColor="#C89388" />
            <stop offset="100%" stopColor="#B87A7D" />
          </linearGradient>
        </defs>

        {/* Sweeping Eyebrow Ribbon merging into 3D Box */}
        <path
          d="M 40 45 C 80 10, 160 15, 230 35 C 270 20, 290 25, 305 32 L 335 15 L 355 30 L 335 48 Z"
          stroke="url(#roseGoldGrad)"
          strokeWidth="2.5"
          fill="none"
        />

        {/* Wireframe Mesh Lines on eyebrow */}
        <path
          d="M 120 28 Q 150 40 180 32 M 150 25 Q 180 38 210 35 M 180 30 Q 210 40 240 38"
          stroke="url(#roseGoldGrad)"
          strokeWidth="1"
          strokeDasharray="2 2"
          opacity="0.8"
        />

        {/* Biometric Fingerprint Circle Emblem */}
        <circle cx="260" cy="35" r="14" stroke="url(#roseGoldGrad)" strokeWidth="1.5" fill="none" />
        <path
          d="M 254 35 C 254 31, 266 31, 266 35 M 251 35 C 251 28, 269 28, 269 35 M 257 35 C 257 33, 263 33, 263 35"
          stroke="url(#roseGoldGrad)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* 3D Box Frame at right end */}
        <path
          d="M 300 35 L 325 15 L 350 35 L 325 55 Z M 325 55 L 325 80 M 300 35 L 300 60 L 325 80 M 350 35 L 350 60 L 325 80"
          stroke="url(#roseGoldGrad)"
          strokeWidth="2"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Main Brand Text: ARTISTIQ */}
        <text
          x="200"
          y="85"
          textAnchor="middle"
          fill="#1E2025"
          fontSize="36"
          fontFamily="Playfair Display, Georgia, serif"
          fontWeight="bold"
          letterSpacing="0.25em"
        >
          ARTISTIQ
        </text>

        {/* Styled Letter Swashes for A, T, Q */}
        <path d="M 62 88 C 50 92, 40 90, 30 85" stroke="url(#roseGoldGrad)" strokeWidth="2" strokeLinecap="round" />
        <path d="M 335 88 C 345 92, 355 94, 368 85" stroke="url(#roseGoldGrad)" strokeWidth="2" strokeLinecap="round" />
      </svg>

      {/* Subtitle Slogan: VOTRE REGARD, SCULPTÉ SUR-MESURE */}
      {showSubtitle && (
        <span className="text-[10px] font-sans uppercase tracking-[0.3em] text-charcoal-muted mt-0.5 font-medium text-center">
          VOTRE REGARD, SCULPTÉ SUR-MESURE
        </span>
      )}

    </div>
  );
};
