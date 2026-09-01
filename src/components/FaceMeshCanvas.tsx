'use client';

import React, { useRef, useEffect, useState } from 'react';

interface FaceMeshCanvasProps {
  isScanning: boolean;
  onLandmarksDetected?: (landmarks: any[]) => void;
  detectionPhase: 'none' | 'detecting' | 'locked';
}

export const FaceMeshCanvas: React.FC<FaceMeshCanvasProps> = ({
  isScanning,
  onLandmarksDetected,
  detectionPhase,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    if (detectionPhase === 'none') {
      const timer = setTimeout(() => {
        onLandmarksDetected?.([{}]);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [detectionPhase, onLandmarksDetected]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = (timestamp: number) => {
      if (canvas.width !== 400 || canvas.height !== 600) {
        canvas.width = 400;
        canvas.height = 600;
      }
      drawOverlay(ctx, canvas.width, canvas.height, timestamp / 1000, detectionPhase, isScanning);
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [detectionPhase, isScanning]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={600}
      className="absolute inset-0 w-full h-full"
      style={{ zIndex: 20 }}
    />
  );
};

function drawOverlay(
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  t: number,
  phase: string,
  scanning: boolean
) {
  ctx.clearRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h / 2;
  const isLocked = phase === 'locked';
  const isDetecting = phase === 'detecting';

  // Colors
  const mainColor = isLocked ? 'rgba(0, 255, 136, 0.7)' : 'rgba(0, 242, 254, 0.6)';
  const glowColor = isLocked ? 'rgba(0, 255, 136, 0.3)' : 'rgba(0, 242, 254, 0.2)';
  const browColor = isLocked ? 'rgba(216, 164, 153, 0.8)' : 'rgba(216, 164, 153, 0.6)';

  // ── FACE OVAL ──
  ctx.save();
  ctx.strokeStyle = mainColor;
  ctx.lineWidth = isLocked ? 2.5 : 1.5;
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 15;

  if (isDetecting) {
    ctx.setLineDash([10, 5]);
    ctx.lineDashOffset = -t * 30;
  }

  ctx.beginPath();
  ctx.ellipse(cx, cy - 15, w * 0.27, h * 0.31, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Inner oval
  ctx.strokeStyle = isLocked ? 'rgba(0, 255, 136, 0.2)' : 'rgba(0, 242, 254, 0.15)';
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  ctx.lineDashOffset = t * 15;
  ctx.beginPath();
  ctx.ellipse(cx, cy - 15, w * 0.27 - 6, h * 0.31 - 6, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // ── LEFT EYEBROW ──
  ctx.save();
  ctx.strokeStyle = browColor;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.shadowColor = 'rgba(216, 164, 153, 0.4)';
  ctx.shadowBlur = 8;
  ctx.setLineDash([]);

  const browY = cy - h * 0.08;
  const browSpread = w * 0.14;

  ctx.beginPath();
  ctx.moveTo(cx - browSpread - 18, browY + 4);
  ctx.bezierCurveTo(
    cx - browSpread - 5, browY - 10,
    cx - browSpread + 12, browY - 12,
    cx - browSpread + 22, browY - 2
  );
  ctx.stroke();

  // ── RIGHT EYEBROW ──
  ctx.beginPath();
  ctx.moveTo(cx + browSpread + 18, browY + 4);
  ctx.bezierCurveTo(
    cx + browSpread + 5, browY - 10,
    cx + browSpread - 12, browY - 12,
    cx + browSpread - 22, browY - 2
  );
  ctx.stroke();
  ctx.restore();

  // ── LEFT EYE ──
  ctx.save();
  ctx.strokeStyle = mainColor;
  ctx.lineWidth = 1.5;
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 6;
  ctx.setLineDash([]);

  const eyeY = cy;
  const eyeSpread = w * 0.11;

  ctx.beginPath();
  ctx.ellipse(cx - eyeSpread, eyeY, 20, 10, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Left iris
  ctx.strokeStyle = isLocked ? 'rgba(0, 255, 136, 0.9)' : 'rgba(0, 242, 254, 0.8)';
  ctx.beginPath();
  ctx.arc(cx - eyeSpread, eyeY, 7, 0, Math.PI * 2);
  ctx.stroke();

  // Left pupil
  ctx.fillStyle = isLocked ? 'rgba(0, 255, 136, 0.7)' : 'rgba(0, 242, 254, 0.6)';
  ctx.beginPath();
  ctx.arc(cx - eyeSpread, eyeY, 3, 0, Math.PI * 2);
  ctx.fill();

  // ── RIGHT EYE ──
  ctx.strokeStyle = mainColor;
  ctx.beginPath();
  ctx.ellipse(cx + eyeSpread, eyeY, 20, 10, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = isLocked ? 'rgba(0, 255, 136, 0.9)' : 'rgba(0, 242, 254, 0.8)';
  ctx.beginPath();
  ctx.arc(cx + eyeSpread, eyeY, 7, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = isLocked ? 'rgba(0, 255, 136, 0.7)' : 'rgba(0, 242, 254, 0.6)';
  ctx.beginPath();
  ctx.arc(cx + eyeSpread, eyeY, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // ── NOSE ──
  ctx.save();
  ctx.strokeStyle = isLocked ? 'rgba(0, 255, 136, 0.4)' : 'rgba(0, 242, 254, 0.3)';
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 2]);

  ctx.beginPath();
  ctx.moveTo(cx, cy - 25);
  ctx.lineTo(cx - 2, cy + 10);
  ctx.stroke();

  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.arc(cx, cy + 12, 4, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // ── MOUTH ──
  ctx.save();
  ctx.strokeStyle = 'rgba(216, 164, 153, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([]);

  const mouthY = cy + 45;

  ctx.beginPath();
  ctx.moveTo(cx - 22, mouthY);
  ctx.bezierCurveTo(cx - 8, mouthY - 5, cx + 8, mouthY - 5, cx + 22, mouthY);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx - 22, mouthY);
  ctx.bezierCurveTo(cx - 8, mouthY + 7, cx + 8, mouthY + 7, cx + 22, mouthY);
  ctx.stroke();
  ctx.restore();

  // ── KEY LANDMARK DOTS ──
  ctx.save();
  const dots = [
    // Eyebrow landmarks
    { x: cx - browSpread - 18, y: browY + 4, c: '#D8A499' },
    { x: cx - browSpread, y: browY - 10, c: '#00F2FE' },
    { x: cx - browSpread + 22, y: browY - 2, c: '#D8A499' },
    { x: cx + browSpread + 18, y: browY + 4, c: '#D8A499' },
    { x: cx + browSpread, y: browY - 10, c: '#00F2FE' },
    { x: cx + browSpread - 22, y: browY - 2, c: '#D8A499' },
    // Eye corners
    { x: cx - eyeSpread - 20, y: eyeY, c: '#00F2FE' },
    { x: cx - eyeSpread + 20, y: eyeY, c: '#00F2FE' },
    { x: cx + eyeSpread - 20, y: eyeY, c: '#00F2FE' },
    { x: cx + eyeSpread + 20, y: eyeY, c: '#00F2FE' },
    // Nose
    { x: cx, y: cy + 12, c: '#D8A499' },
    // Mouth corners
    { x: cx - 22, y: mouthY, c: '#D8A499' },
    { x: cx + 22, y: mouthY, c: '#D8A499' },
  ];

  dots.forEach((d, i) => {
    const pulse = Math.sin(t * 3 + i * 0.5) * 0.3 + 0.7;
    ctx.beginPath();
    ctx.arc(d.x, d.y, 2, 0, Math.PI * 2);
    ctx.fillStyle = d.c;
    ctx.globalAlpha = pulse;
    ctx.shadowColor = d.c;
    ctx.shadowBlur = 6;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  });
  ctx.restore();

  // ── SCANNING LASER ──
  if (scanning) {
    ctx.save();
    const laserY = ((t * 0.4) % 1) * h;

    ctx.beginPath();
    ctx.moveTo(0, laserY);
    ctx.lineTo(w, laserY);
    ctx.strokeStyle = 'rgba(0, 242, 254, 0.7)';
    ctx.lineWidth = 2;
    ctx.shadowColor = 'rgba(0, 242, 254, 0.9)';
    ctx.shadowBlur = 15;
    ctx.stroke();
    ctx.shadowBlur = 0;

    const grad = ctx.createLinearGradient(0, laserY - 25, 0, laserY + 25);
    grad.addColorStop(0, 'rgba(0, 242, 254, 0)');
    grad.addColorStop(0.5, 'rgba(0, 242, 254, 0.1)');
    grad.addColorStop(1, 'rgba(0, 242, 254, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, laserY - 25, w, 50);
    ctx.restore();
  }

  // ── CORNER BRACKETS ──
  ctx.save();
  const bracketColor = isLocked ? 'rgba(0, 255, 136, 0.5)' : 'rgba(0, 242, 254, 0.4)';
  ctx.strokeStyle = bracketColor;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  const s = 25;
  const m = 18;

  // Top-left
  ctx.beginPath();
  ctx.moveTo(m, m + s); ctx.lineTo(m, m); ctx.lineTo(m + s, m);
  ctx.stroke();
  // Top-right
  ctx.beginPath();
  ctx.moveTo(w - m - s, m); ctx.lineTo(w - m, m); ctx.lineTo(w - m, m + s);
  ctx.stroke();
  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(m, h - m - s); ctx.lineTo(m, h - m); ctx.lineTo(m + s, h - m);
  ctx.stroke();
  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(w - m - s, h - m); ctx.lineTo(w - m, h - m); ctx.lineTo(w - m, h - m - s);
  ctx.stroke();
  ctx.restore();

  // ── DETECTION LABELS ──
  if (phase !== 'none') {
    ctx.save();
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';

    const labels = [
      { text: 'SOURCIL G', x: w * 0.13, y: browY - 20, color: '#D8A499' },
      { text: 'SOURCIL D', x: w * 0.87, y: browY - 20, color: '#D8A499' },
      { text: 'OEIL G', x: w * 0.22, y: eyeY - 18, color: '#00F2FE' },
      { text: 'OEIL D', x: w * 0.78, y: eyeY - 18, color: '#00F2FE' },
      { text: 'NEZ', x: cx, y: cy + 25, color: '#00F2FE' },
      { text: 'BOUCHE', x: cx, y: mouthY + 18, color: '#D8A499' },
    ];

    labels.forEach((label) => {
      const m = ctx.measureText(label.text);
      const pw = m.width + 14;
      const ph = 14;

      ctx.fillStyle = 'rgba(11, 10, 15, 0.75)';
      ctx.beginPath();
      ctx.roundRect(label.x - pw / 2, label.y - ph / 2, pw, ph, 7);
      ctx.fill();

      ctx.strokeStyle = isLocked ? 'rgba(0, 255, 136, 0.25)' : 'rgba(0, 242, 254, 0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Status dot
      ctx.beginPath();
      ctx.arc(label.x - pw / 2 + 7, label.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = isLocked ? '#00FF88' : '#00F2FE';
      ctx.fill();

      ctx.fillStyle = label.color;
      ctx.fillText(label.text, label.x + 3, label.y + 3);
    });
    ctx.restore();
  }

  // ── MEASUREMENTS (when locked) ──
  if (isLocked) {
    ctx.save();
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';

    // Inter-eyebrow line
    ctx.beginPath();
    ctx.moveTo(cx - browSpread + 22, browY - 2);
    ctx.lineTo(cx + browSpread - 22, browY - 2);
    ctx.strokeStyle = 'rgba(216, 164, 153, 0.4)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 2]);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#D8A499';
    ctx.fillText('24.1mm', cx, browY - 25);

    ctx.fillStyle = 'rgba(0, 242, 254, 0.6)';
    ctx.fillText('52.3mm', cx - browSpread, browY - 30);
    ctx.fillText('51.8mm', cx + browSpread, browY - 30);

    ctx.restore();
  }
}

export default FaceMeshCanvas;
