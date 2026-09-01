'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';

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
  const timeRef = useRef<number>(0);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = (timestamp: number) => {
      timeRef.current = timestamp;
      const video = document.querySelector('video[data-face-mesh]') as HTMLVideoElement;
      
      if (canvas.width !== 400 || canvas.height !== 600) {
        canvas.width = 400;
        canvas.height = 600;
      }

      drawFaceMesh(ctx, canvas.width, canvas.height, timestamp, video, detectionPhase, isScanning);
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [detectionPhase, isScanning]);

  // Simulate face detection after camera is active
  useEffect(() => {
    if (detectionPhase === 'none') {
      const timer = setTimeout(() => {
        onLandmarksDetected?.([/* simulated landmarks */]);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [detectionPhase, onLandmarksDetected]);

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

// ── MAIN DRAWING FUNCTION ──
function drawFaceMesh(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  video: HTMLVideoElement | null,
  detectionPhase: 'none' | 'detecting' | 'locked',
  isScanning: boolean
) {
  ctx.clearRect(0, 0, width, height);

  const cx = width / 2;
  const cy = height / 2;
  const t = time / 1000;

  // ── BACKGROUND GRID (futuristic) ──
  drawGrid(ctx, width, height, t, detectionPhase);

  // ── FACE OVAL ──
  const faceColor = detectionPhase === 'locked' ? 'rgba(0, 255, 136, 0.6)' : 'rgba(0, 242, 254, 0.5)';
  const faceGlow = detectionPhase === 'locked' ? 'rgba(0, 255, 136, 0.3)' : 'rgba(0, 242, 254, 0.2)';
  
  drawFaceOval(ctx, cx, cy, width, height, faceColor, faceGlow, t, detectionPhase);

  // ── EYEBROWS (detailed, Rose Gold) ──
  drawEyebrows(ctx, cx, cy, width, height, t, detectionPhase);

  // ── EYES (with iris tracking) ──
  drawEyes(ctx, cx, cy, width, height, t, detectionPhase);

  // ── NOSE ──
  drawNose(ctx, cx, cy, t, detectionPhase);

  // ── MOUTH ──
  drawMouth(ctx, cx, cy, t, detectionPhase);

  // ── LANDMARK POINTS (468 style) ──
  drawLandmarkPoints(ctx, cx, cy, width, height, t, detectionPhase);

  // ── SCANNING LASER ──
  if (isScanning) {
    drawScanningLaser(ctx, width, height, t);
  }

  // ── CORNER BRACKETS ──
  drawCornerBrackets(ctx, width, height, detectionPhase);

  // ── DETECTION LABELS ──
  if (detectionPhase !== 'none') {
    drawDetectionLabels(ctx, cx, cy, width, height, detectionPhase);
  }

  // ── MEASUREMENTS (when locked) ──
  if (detectionPhase === 'locked') {
    drawMeasurements(ctx, cx, cy);
  }
}

// ── GRID BACKGROUND ──
function drawGrid(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, phase: string) {
  ctx.save();
  ctx.strokeStyle = phase === 'locked' ? 'rgba(0, 255, 136, 0.05)' : 'rgba(0, 242, 254, 0.04)';
  ctx.lineWidth = 0.5;

  const gridSize = 30;
  const offset = (t * 10) % gridSize;

  for (let x = offset; x < w; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = offset; y < h; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  ctx.restore();
}

// ── FACE OVAL ──
function drawFaceOval(
  ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number,
  color: string, glow: string, t: number, phase: string
) {
  ctx.save();
  
  const rx = w * 0.28;
  const ry = h * 0.32;
  const offsetY = -h * 0.03;

  // Outer glow
  ctx.shadowColor = glow;
  ctx.shadowBlur = 20;
  ctx.strokeStyle = color;
  ctx.lineWidth = phase === 'locked' ? 2.5 : 1.5;
  
  if (phase === 'detecting') {
    ctx.setLineDash([12, 6]);
    ctx.lineDashOffset = -t * 30;
  } else {
    ctx.setLineDash([]);
  }

  ctx.beginPath();
  ctx.ellipse(cx, cy + offsetY, rx, ry, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Inner oval
  ctx.shadowBlur = 10;
  ctx.strokeStyle = phase === 'locked' ? 'rgba(0, 255, 136, 0.3)' : 'rgba(0, 242, 254, 0.2)';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.lineDashOffset = t * 20;
  ctx.beginPath();
  ctx.ellipse(cx, cy + offsetY, rx - 8, ry - 8, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Pulse ring
  const pulseScale = 1 + Math.sin(t * 2) * 0.02;
  ctx.strokeStyle = phase === 'locked' ? 'rgba(0, 255, 136, 0.15)' : 'rgba(0, 242, 254, 0.1)';
  ctx.lineWidth = 1;
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.ellipse(cx, cy + offsetY, rx * pulseScale, ry * pulseScale, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

// ── EYEBROWS (detailed curves) ──
function drawEyebrows(
  ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number,
  t: number, phase: string
) {
  ctx.save();
  
  const browY = cy - h * 0.08;
  const browSpread = w * 0.15;
  const archHeight = 12;
  const browColor = phase === 'locked' ? '#D8A499' : 'rgba(216, 164, 153, 0.7)';
  const browGlow = phase === 'locked' ? 'rgba(216, 164, 153, 0.5)' : 'rgba(216, 164, 153, 0.3)';

  // Left eyebrow
  ctx.shadowColor = browGlow;
  ctx.shadowBlur = 8;
  ctx.strokeStyle = browColor;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.setLineDash([]);

  ctx.beginPath();
  ctx.moveTo(cx - browSpread - 20, browY + 5);
  ctx.bezierCurveTo(
    cx - browSpread - 5, browY - archHeight,
    cx - browSpread + 15, browY - archHeight - 2,
    cx - browSpread + 25, browY
  );
  ctx.stroke();

  // Left eyebrow thickness line
  ctx.strokeStyle = 'rgba(0, 242, 254, 0.3)';
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  ctx.lineDashOffset = -t * 15;
  ctx.beginPath();
  ctx.moveTo(cx - browSpread - 18, browY + 10);
  ctx.bezierCurveTo(
    cx - browSpread - 3, browY - archHeight + 5,
    cx - browSpread + 17, browY - archHeight + 3,
    cx - browSpread + 27, browY + 5
  );
  ctx.stroke();

  // Right eyebrow
  ctx.shadowColor = browGlow;
  ctx.shadowBlur = 8;
  ctx.strokeStyle = browColor;
  ctx.lineWidth = 3;
  ctx.setLineDash([]);

  ctx.beginPath();
  ctx.moveTo(cx + browSpread + 20, browY + 5);
  ctx.bezierCurveTo(
    cx + browSpread + 5, browY - archHeight,
    cx + browSpread - 15, browY - archHeight - 2,
    cx + browSpread - 25, browY
  );
  ctx.stroke();

  // Right eyebrow thickness line
  ctx.strokeStyle = 'rgba(0, 242, 254, 0.3)';
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  ctx.lineDashOffset = -t * 15;
  ctx.beginPath();
  ctx.moveTo(cx + browSpread + 18, browY + 10);
  ctx.bezierCurveTo(
    cx + browSpread + 3, browY - archHeight + 5,
    cx + browSpread - 17, browY - archHeight + 3,
    cx + browSpread - 27, browY + 5
  );
  ctx.stroke();

  ctx.restore();
}

// ── EYES ──
function drawEyes(
  ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number,
  t: number, phase: string
) {
  ctx.save();
  
  const eyeY = cy - h * 0.02;
  const eyeSpread = w * 0.12;
  const eyeColor = phase === 'locked' ? 'rgba(0, 255, 136, 0.7)' : 'rgba(0, 242, 254, 0.6)';

  // Left eye
  ctx.strokeStyle = eyeColor;
  ctx.lineWidth = 1.5;
  ctx.shadowColor = phase === 'locked' ? 'rgba(0, 255, 136, 0.3)' : 'rgba(0, 242, 254, 0.3)';
  ctx.shadowBlur = 6;
  ctx.setLineDash([]);

  ctx.beginPath();
  ctx.ellipse(cx - eyeSpread, eyeY, 22, 11, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Left iris
  ctx.strokeStyle = phase === 'locked' ? 'rgba(0, 255, 136, 0.9)' : 'rgba(0, 242, 254, 0.8)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(cx - eyeSpread, eyeY, 8, 8, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Left pupil
  ctx.fillStyle = phase === 'locked' ? 'rgba(0, 255, 136, 0.8)' : 'rgba(0, 242, 254, 0.7)';
  ctx.beginPath();
  ctx.arc(cx - eyeSpread, eyeY, 3, 0, Math.PI * 2);
  ctx.fill();

  // Right eye
  ctx.strokeStyle = eyeColor;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(cx + eyeSpread, eyeY, 22, 11, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Right iris
  ctx.strokeStyle = phase === 'locked' ? 'rgba(0, 255, 136, 0.9)' : 'rgba(0, 242, 254, 0.8)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(cx + eyeSpread, eyeY, 8, 8, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Right pupil
  ctx.fillStyle = phase === 'locked' ? 'rgba(0, 255, 136, 0.8)' : 'rgba(0, 242, 254, 0.7)';
  ctx.beginPath();
  ctx.arc(cx + eyeSpread, eyeY, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// ── NOSE ──
function drawNose(ctx: CanvasRenderingContext2D, cx: number, cy: number, t: number, phase: string) {
  ctx.save();
  
  const noseColor = phase === 'locked' ? 'rgba(0, 255, 136, 0.5)' : 'rgba(0, 242, 254, 0.4)';
  
  ctx.strokeStyle = noseColor;
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 3]);
  ctx.lineDashOffset = -t * 10;

  // Nose bridge
  ctx.beginPath();
  ctx.moveTo(cx, cy - 30);
  ctx.lineTo(cx - 3, cy + 10);
  ctx.stroke();

  // Nose tip
  ctx.setLineDash([]);
  ctx.strokeStyle = phase === 'locked' ? 'rgba(0, 255, 136, 0.6)' : 'rgba(0, 242, 254, 0.5)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy + 12, 5, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

// ── MOUTH ──
function drawMouth(ctx: CanvasRenderingContext2D, cx: number, cy: number, t: number, phase: string) {
  ctx.save();
  
  const mouthY = cy + 50;
  const mouthColor = phase === 'locked' ? 'rgba(216, 164, 153, 0.5)' : 'rgba(216, 164, 153, 0.4)';
  
  ctx.strokeStyle = mouthColor;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([]);

  // Upper lip
  ctx.beginPath();
  ctx.moveTo(cx - 25, mouthY);
  ctx.bezierCurveTo(cx - 10, mouthY - 6, cx + 10, mouthY - 6, cx + 25, mouthY);
  ctx.stroke();

  // Lower lip
  ctx.beginPath();
  ctx.moveTo(cx - 25, mouthY);
  ctx.bezierCurveTo(cx - 10, mouthY + 8, cx + 10, mouthY + 8, cx + 25, mouthY);
  ctx.stroke();

  ctx.restore();
}

// ── LANDMARK POINTS ──
function drawLandmarkPoints(
  ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number,
  t: number, phase: string
) {
  ctx.save();
  
  const points = [
    // Eyebrow landmarks
    { x: cx - w * 0.15 - 20, y: cy - h * 0.08 + 5, color: '#D8A499' },
    { x: cx - w * 0.15 - 10, y: cy - h * 0.08 - 5, color: '#00F2FE' },
    { x: cx - w * 0.15, y: cy - h * 0.08 - 10, color: '#D8A499' },
    { x: cx - w * 0.15 + 10, y: cy - h * 0.08 - 8, color: '#00F2FE' },
    { x: cx - w * 0.15 + 20, y: cy - h * 0.08, color: '#D8A499' },
    { x: cx + w * 0.15 + 20, y: cy - h * 0.08 + 5, color: '#D8A499' },
    { x: cx + w * 0.15 + 10, y: cy - h * 0.08 - 5, color: '#00F2FE' },
    { x: cx + w * 0.15, y: cy - h * 0.08 - 10, color: '#D8A499' },
    { x: cx + w * 0.15 - 10, y: cy - h * 0.08 - 8, color: '#00F2FE' },
    { x: cx + w * 0.15 - 20, y: cy - h * 0.08, color: '#D8A499' },
    // Eye landmarks
    { x: cx - w * 0.12 - 22, y: cy - h * 0.02, color: '#00F2FE' },
    { x: cx - w * 0.12, y: cy - h * 0.02 - 11, color: '#00F2FE' },
    { x: cx - w * 0.12 + 22, y: cy - h * 0.02, color: '#00F2FE' },
    { x: cx - w * 0.12, y: cy - h * 0.02 + 11, color: '#00F2FE' },
    { x: cx + w * 0.12 - 22, y: cy - h * 0.02, color: '#00F2FE' },
    { x: cx + w * 0.12, y: cy - h * 0.02 - 11, color: '#00F2FE' },
    { x: cx + w * 0.12 + 22, y: cy - h * 0.02, color: '#00F2FE' },
    { x: cx + w * 0.12, y: cy - h * 0.02 + 11, color: '#00F2FE' },
    // Nose landmarks
    { x: cx, y: cy - 30, color: '#00F2FE' },
    { x: cx, y: cy + 12, color: '#D8A499' },
    // Mouth landmarks
    { x: cx - 25, y: cy + 50, color: '#D8A499' },
    { x: cx, y: cy + 44, color: '#D8A499' },
    { x: cx + 25, y: cy + 50, color: '#D8A499' },
    { x: cx, y: cy + 58, color: '#D8A499' },
  ];

  points.forEach((p, i) => {
    const pulse = Math.sin(t * 3 + i * 0.5) * 0.5 + 0.5;
    const size = 1.5 + pulse * 1;
    
    ctx.beginPath();
    ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 6;
    ctx.fill();
    ctx.shadowBlur = 0;
  });

  ctx.restore();
}

// ── SCANNING LASER ──
function drawScanningLaser(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  ctx.save();
  
  const y = ((t * 0.5) % 1) * h;
  
  // Main laser line
  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.lineTo(w, y);
  ctx.strokeStyle = 'rgba(0, 242, 254, 0.8)';
  ctx.lineWidth = 2;
  ctx.shadowColor = 'rgba(0, 242, 254, 0.9)';
  ctx.shadowBlur = 20;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Glow gradient
  const gradient = ctx.createLinearGradient(0, y - 30, 0, y + 30);
  gradient.addColorStop(0, 'rgba(0, 242, 254, 0)');
  gradient.addColorStop(0.5, 'rgba(0, 242, 254, 0.15)');
  gradient.addColorStop(1, 'rgba(0, 242, 254, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, y - 30, w, 60);

  ctx.restore();
}

// ── CORNER BRACKETS ──
function drawCornerBrackets(
  ctx: CanvasRenderingContext2D, w: number, h: number, phase: string
) {
  ctx.save();
  
  const color = phase === 'locked' ? 'rgba(0, 255, 136, 0.6)' : 'rgba(0, 242, 254, 0.5)';
  const size = 30;
  const margin = 20;

  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';

  // Top-left
  ctx.beginPath();
  ctx.moveTo(margin, margin + size);
  ctx.lineTo(margin, margin);
  ctx.lineTo(margin + size, margin);
  ctx.stroke();

  // Top-right
  ctx.beginPath();
  ctx.moveTo(w - margin - size, margin);
  ctx.lineTo(w - margin, margin);
  ctx.lineTo(w - margin, margin + size);
  ctx.stroke();

  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(margin, h - margin - size);
  ctx.lineTo(margin, h - margin);
  ctx.lineTo(margin + size, h - margin);
  ctx.stroke();

  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(w - margin - size, h - margin);
  ctx.lineTo(w - margin, h - margin);
  ctx.lineTo(w - margin, h - margin - size);
  ctx.stroke();

  ctx.restore();
}

// ── DETECTION LABELS ──
function drawDetectionLabels(
  ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number,
  phase: string
) {
  ctx.save();
  
  ctx.font = '9px monospace';
  ctx.textAlign = 'center';

  const labels = [
    { text: 'SOURCIL G', x: w * 0.12, y: cy - h * 0.12, color: '#D8A499' },
    { text: 'SOURCIL D', x: w * 0.88, y: cy - h * 0.12, color: '#D8A499' },
    { text: 'OEIL G', x: w * 0.2, y: cy - h * 0.04, color: '#00F2FE' },
    { text: 'OEIL D', x: w * 0.8, y: cy - h * 0.04, color: '#00F2FE' },
    { text: 'NEZ', x: cx, y: cy + h * 0.06, color: '#00F2FE' },
    { text: 'BOUCHE', x: cx, y: cy + h * 0.12, color: '#D8A499' },
  ];

  labels.forEach((label) => {
    const dotColor = phase === 'locked' ? '#00FF88' : '#00F2FE';
    
    // Background pill
    const metrics = ctx.measureText(label.text);
    const pillW = metrics.width + 16;
    const pillH = 16;
    
    ctx.fillStyle = 'rgba(11, 10, 15, 0.7)';
    ctx.beginPath();
    ctx.roundRect(label.x - pillW / 2, label.y - pillH / 2, pillW, pillH, 8);
    ctx.fill();
    
    ctx.strokeStyle = phase === 'locked' ? 'rgba(0, 255, 136, 0.3)' : 'rgba(0, 242, 254, 0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Dot
    ctx.beginPath();
    ctx.arc(label.x - pillW / 2 + 8, label.y, 2, 0, Math.PI * 2);
    ctx.fillStyle = dotColor;
    ctx.fill();

    // Text
    ctx.fillStyle = label.color;
    ctx.fillText(label.text, label.x + 4, label.y + 3);
  });

  ctx.restore();
}

// ── MEASUREMENTS ──
function drawMeasurements(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.save();
  
  ctx.font = '10px monospace';
  ctx.textAlign = 'center';

  // Inter-eyebrow distance
  const leftBrowX = cx - 65;
  const rightBrowX = cx + 65;
  const browY = cy - 60;

  ctx.beginPath();
  ctx.moveTo(leftBrowX, browY);
  ctx.lineTo(rightBrowX, browY);
  ctx.strokeStyle = 'rgba(216, 164, 153, 0.5)';
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 2]);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = '#D8A499';
  ctx.fillText('24.1mm', cx, browY - 8);

  // Left eyebrow length
  ctx.fillStyle = 'rgba(0, 242, 254, 0.6)';
  ctx.fillText('52.3mm', cx - 65, cy - 80);

  // Right eyebrow length
  ctx.fillText('51.8mm', cx + 65, cy - 80);

  ctx.restore();
}

export default FaceMeshCanvas;
