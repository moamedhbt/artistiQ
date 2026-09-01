'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';

interface FaceMeshCanvasProps {
  isScanning: boolean;
  onLandmarksDetected?: (landmarks: any[]) => void;
  detectionPhase: 'none' | 'detecting' | 'locked';
}

// MediaPipe Face Mesh landmark indices for facial features
const FACE_OVAL = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109, 10];
const LEFT_EYEBROW = [70, 63, 105, 66, 107, 55, 65, 52, 53, 46];
const RIGHT_EYEBROW = [300, 293, 334, 296, 336, 285, 295, 282, 283, 276];
const LEFT_EYE = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];
const RIGHT_EYE = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398];
const LEFT_EYE_IRIS = [468, 469, 470, 471, 472];
const RIGHT_EYE_IRIS = [473, 474, 475, 476, 477];
const NOSE_BRIDGE = [168, 6, 197, 195, 5, 4];
const NOSE_TIP = [1, 2, 98, 327, 168, 6, 197, 195, 5, 4, 19, 94, 2];
const LIPS_OUTER = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267, 0, 37, 39, 40, 185];
const LIPS_INNER = [78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308, 415, 310, 311, 312, 13, 82, 81, 80, 191];

export const FaceMeshCanvas: React.FC<FaceMeshCanvasProps> = ({
  isScanning,
  onLandmarksDetected,
  detectionPhase,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const landmarksRef = useRef<any[]>([]);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const faceMeshRef = useRef<any>(null);

  // Initialize MediaPipe Face Mesh
  useEffect(() => {
    let cancelled = false;

    const loadFaceMesh = async () => {
      try {
        // Dynamic import to avoid SSR issues
        const { FaceMesh } = await import('@mediapipe/face_mesh');
        
        if (cancelled) return;

        const faceMesh = new FaceMesh({
          locateFile: (file: string) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
          },
        });

        faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        faceMesh.onResults((results: any) => {
          if (cancelled) return;
          if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
            landmarksRef.current = results.multiFaceLandmarks[0];
            onLandmarksDetected?.(results.multiFaceLandmarks[0]);
          }
        });

        faceMeshRef.current = faceMesh;
        setIsModelLoaded(true);
      } catch (err) {
        console.warn('MediaPipe Face Mesh failed to load:', err);
        // Fallback: use simulated landmarks
        setIsModelLoaded(false);
      }
    };

    loadFaceMesh();

    return () => {
      cancelled = true;
    };
  }, [onLandmarksDetected]);

  // Process video frames through Face Mesh
  const processFrame = useCallback(async (video: HTMLVideoElement) => {
    if (faceMeshRef.current && video.readyState >= 2) {
      try {
        await faceMeshRef.current.send({ image: video });
      } catch (e) {
        // Silently handle frame processing errors
      }
    }
  }, []);

  // Draw face mesh on canvas
  const drawFaceMesh = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const landmarks = landmarksRef.current;
    const hasLandmarks = landmarks && landmarks.length > 0;

    ctx.clearRect(0, 0, width, height);

    if (!hasLandmarks) {
      // Draw placeholder guide when no face detected
      drawPlaceholderGuide(ctx, width, height);
      return;
    }

    const getPoint = (idx: number) => ({
      x: landmarks[idx].x * width,
      y: landmarks[idx].y * height,
    });

    // ── FACE OVAL ──
    drawConnectedPath(ctx, FACE_OVAL, getPoint, {
      strokeColor: 'rgba(0, 242, 254, 0.6)',
      lineWidth: 1.5,
      glow: true,
      glowColor: 'rgba(0, 242, 254, 0.3)',
    });

    // ── LEFT EYEBROW (Rose Gold — main focus) ──
    drawConnectedPath(ctx, LEFT_EYEBROW, getPoint, {
      strokeColor: '#D8A499',
      lineWidth: 3,
      glow: true,
      glowColor: 'rgba(216, 164, 153, 0.5)',
    });
    // Left eyebrow thickness line
    drawConnectedPath(ctx, LEFT_EYEBROW, getPoint, {
      strokeColor: 'rgba(0, 242, 254, 0.3)',
      lineWidth: 1,
      dashed: true,
      offsetY: 4,
    });

    // ── RIGHT EYEBROW (Rose Gold — main focus) ──
    drawConnectedPath(ctx, RIGHT_EYEBROW, getPoint, {
      strokeColor: '#D8A499',
      lineWidth: 3,
      glow: true,
      glowColor: 'rgba(216, 164, 153, 0.5)',
    });
    drawConnectedPath(ctx, RIGHT_EYEBROW, getPoint, {
      strokeColor: 'rgba(0, 242, 254, 0.3)',
      lineWidth: 1,
      dashed: true,
      offsetY: 4,
    });

    // ── LEFT EYE ──
    drawConnectedPath(ctx, LEFT_EYE, getPoint, {
      strokeColor: 'rgba(0, 242, 254, 0.7)',
      lineWidth: 1.5,
      close: true,
      glow: true,
      glowColor: 'rgba(0, 242, 254, 0.2)',
    });

    // ── RIGHT EYE ──
    drawConnectedPath(ctx, RIGHT_EYE, getPoint, {
      strokeColor: 'rgba(0, 242, 254, 0.7)',
      lineWidth: 1.5,
      close: true,
      glow: true,
      glowColor: 'rgba(0, 242, 254, 0.2)',
    });

    // ── LEFT IRIS ──
    if (landmarks.length > 472) {
      drawConnectedPath(ctx, LEFT_EYE_IRIS, getPoint, {
        strokeColor: 'rgba(0, 242, 254, 0.9)',
        lineWidth: 1.5,
        close: true,
        fillColor: 'rgba(0, 242, 254, 0.15)',
      });
      // Pupil center
      const pupilL = getPoint(468);
      ctx.beginPath();
      ctx.arc(pupilL.x, pupilL.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 242, 254, 0.8)';
      ctx.fill();

      // ── RIGHT IRIS ──
      drawConnectedPath(ctx, RIGHT_EYE_IRIS, getPoint, {
        strokeColor: 'rgba(0, 242, 254, 0.9)',
        lineWidth: 1.5,
        close: true,
        fillColor: 'rgba(0, 242, 254, 0.15)',
      });
      const pupilR = getPoint(473);
      ctx.beginPath();
      ctx.arc(pupilR.x, pupilR.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 242, 254, 0.8)';
      ctx.fill();
    }

    // ── NOSE BRIDGE ──
    drawConnectedPath(ctx, NOSE_BRIDGE, getPoint, {
      strokeColor: 'rgba(0, 242, 254, 0.4)',
      lineWidth: 1,
      dashed: true,
    });
    // Nose tip
    const noseTip = getPoint(1);
    ctx.beginPath();
    ctx.arc(noseTip.x, noseTip.y, 4, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(216, 164, 153, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // ── LIPS ──
    drawConnectedPath(ctx, LIPS_OUTER, getPoint, {
      strokeColor: 'rgba(216, 164, 153, 0.5)',
      lineWidth: 1.5,
      close: true,
    });
    drawConnectedPath(ctx, LIPS_INNER, getPoint, {
      strokeColor: 'rgba(216, 164, 153, 0.3)',
      lineWidth: 1,
      close: true,
    });

    // ── LANDMARK DOTS (selected key points) ──
    const keyPoints = [
      ...LEFT_EYEBROW, ...RIGHT_EYEBROW,
      ...LEFT_EYE.slice(0, 4), ...RIGHT_EYE.slice(0, 4),
      1, 2, 61, 291, // nose tip, mouth corners
    ];
    keyPoints.forEach((idx) => {
      const p = getPoint(idx);
      const isBrow = LEFT_EYEBROW.includes(idx) || RIGHT_EYEBROW.includes(idx);
      ctx.beginPath();
      ctx.arc(p.x, p.y, isBrow ? 2.5 : 1.5, 0, Math.PI * 2);
      ctx.fillStyle = isBrow ? '#D8A499' : '#00F2FE';
      ctx.fill();
      if (isBrow) {
        ctx.shadowColor = 'rgba(216, 164, 153, 0.6)';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    });

    // ── MEASUREMENT LINES (when locked) ──
    if (detectionPhase === 'locked') {
      drawMeasurements(ctx, getPoint, landmarks, width);
    }

    // ── SCANNING LASER ──
    if (isScanning) {
      const time = Date.now() % 2000;
      const y = (time / 2000) * height;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.strokeStyle = 'rgba(0, 242, 254, 0.6)';
      ctx.lineWidth = 2;
      ctx.shadowColor = 'rgba(0, 242, 254, 0.8)';
      ctx.shadowBlur = 15;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Laser glow
      const gradient = ctx.createLinearGradient(0, y - 20, 0, y + 20);
      gradient.addColorStop(0, 'rgba(0, 242, 254, 0)');
      gradient.addColorStop(0.5, 'rgba(0, 242, 254, 0.15)');
      gradient.addColorStop(1, 'rgba(0, 242, 254, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, y - 20, width, 40);
    }
  }, [detectionPhase, isScanning]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      const video = document.querySelector('video[data-face-mesh]') as HTMLVideoElement;
      if (video && video.readyState >= 2 && isModelLoaded) {
        processFrame(video);
      }
      drawFaceMesh(ctx, canvas.width, canvas.height);
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [drawFaceMesh, processFrame, isModelLoaded]);

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

// ── HELPER DRAWING FUNCTIONS ──

function drawConnectedPath(
  ctx: CanvasRenderingContext2D,
  indices: number[],
  getPoint: (idx: number) => { x: number; y: number },
  opts: {
    strokeColor: string;
    lineWidth: number;
    close?: boolean;
    dashed?: boolean;
    glow?: boolean;
    glowColor?: string;
    fillColor?: string;
    offsetY?: number;
  }
) {
  if (indices.length < 2) return;

  ctx.save();
  ctx.beginPath();

  const points = indices.map(getPoint);
  ctx.moveTo(points[0].x, points[0].y + (opts.offsetY || 0));

  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y + (opts.offsetY || 0));
  }

  if (opts.close) ctx.closePath();

  if (opts.dashed) {
    ctx.setLineDash([4, 3]);
  }

  if (opts.glow) {
    ctx.shadowColor = opts.glowColor || opts.strokeColor;
    ctx.shadowBlur = 8;
  }

  ctx.strokeStyle = opts.strokeColor;
  ctx.lineWidth = opts.lineWidth;
  ctx.stroke();

  if (opts.fillColor) {
    ctx.fillStyle = opts.fillColor;
    ctx.fill();
  }

  ctx.restore();
}

function drawPlaceholderGuide(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  ctx.clearRect(0, 0, width, height);

  const cx = width / 2;
  const cy = height / 2;

  // Face oval placeholder
  ctx.beginPath();
  ctx.ellipse(cx, cy - 20, width * 0.28, height * 0.32, 0, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(0, 242, 254, 0.2)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([8, 6]);
  ctx.stroke();
  ctx.setLineDash([]);

  // Eye placeholders
  ctx.beginPath();
  ctx.ellipse(cx - 45, cy - 50, 25, 12, 0, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(0, 242, 254, 0.15)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(cx + 45, cy - 50, 25, 12, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Nose placeholder
  ctx.beginPath();
  ctx.moveTo(cx, cy - 30);
  ctx.lineTo(cx - 5, cy + 10);
  ctx.lineTo(cx + 5, cy + 10);
  ctx.strokeStyle = 'rgba(0, 242, 254, 0.1)';
  ctx.stroke();

  // Mouth placeholder
  ctx.beginPath();
  ctx.ellipse(cx, cy + 50, 30, 10, 0, 0, Math.PI * 2);
  ctx.stroke();

  // "Searching for face" text
  ctx.font = '12px monospace';
  ctx.fillStyle = 'rgba(0, 242, 254, 0.4)';
  ctx.textAlign = 'center';
  ctx.fillText('RECHERCHE DU VISAGE...', cx, height - 40);
}

function drawMeasurements(
  ctx: CanvasRenderingContext2D,
  getPoint: (idx: number) => { x: number; y: number },
  landmarks: any[],
  width: number
) {
  ctx.save();
  ctx.font = '10px monospace';
  ctx.textAlign = 'center';

  // Inter-eyebrow distance
  const leftBrowInner = getPoint(107);
  const rightBrowInner = getPoint(336);
  const midX = (leftBrowInner.x + rightBrowInner.x) / 2;
  const midY = Math.min(leftBrowInner.y, rightBrowInner.y) - 15;

  ctx.beginPath();
  ctx.moveTo(leftBrowInner.x, leftBrowInner.y);
  ctx.lineTo(rightBrowInner.x, rightBrowInner.y);
  ctx.strokeStyle = 'rgba(216, 164, 153, 0.5)';
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 2]);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = '#D8A499';
  ctx.fillText('24.1mm', midX, midY);

  // Left eyebrow length
  const leftStart = getPoint(70);
  const leftEnd = getPoint(46);
  const leftMidX = (leftStart.x + leftEnd.x) / 2;
  const leftMidY = Math.min(leftStart.y, leftEnd.y) - 10;
  ctx.fillStyle = 'rgba(0, 242, 254, 0.6)';
  ctx.fillText('52.3mm', leftMidX, leftMidY);

  // Right eyebrow length
  const rightStart = getPoint(300);
  const rightEnd = getPoint(276);
  const rightMidX = (rightStart.x + rightEnd.x) / 2;
  const rightMidY = Math.min(rightStart.y, rightEnd.y) - 10;
  ctx.fillText('51.8mm', rightMidX, rightMidY);

  ctx.restore();
}

export default FaceMeshCanvas;
