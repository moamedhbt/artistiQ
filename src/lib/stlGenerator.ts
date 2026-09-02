import { EyebrowCustomParams, BiometricMeasurements } from '@/types';
import * as THREE from 'three';

// MediaPipe Face Mesh eyebrow landmark indices
const LEFT_EYEBROW_INDICES = [70, 63, 105, 66, 107, 55, 65, 52, 53, 46];
const RIGHT_EYEBROW_INDICES = [300, 293, 334, 296, 336, 285, 295, 282, 283, 276];

/**
 * Creates a 3D printable eyebrow stencil using actual face landmarks
 * The window shape matches the client's real eyebrow contour
 */
export function createEyebrowStencil3DGeometry(
  params: EyebrowCustomParams,
  biometrics: BiometricMeasurements,
  faceLandmarks?: { x: number; y: number; z: number }[]
): { stencilMesh: THREE.BufferGeometry; moldMesh: THREE.BufferGeometry } {
  
  // ── DIMENSIONS (mm) ──
  const W = 80;
  const H = 45;
  const D = params.stencilThicknessMm || 2.0;

  // ── OUTER SHAPE: Rounded rectangle ──
  const outer = new THREE.Shape();
  const r = 6;
  outer.moveTo(-W/2 + r, -H/2);
  outer.lineTo(W/2 - r, -H/2);
  outer.quadraticCurveTo(W/2, -H/2, W/2, -H/2 + r);
  outer.lineTo(W/2, H/2 - r);
  outer.quadraticCurveTo(W/2, H/2, W/2 - r, H/2);
  outer.lineTo(-W/2 + r, H/2);
  outer.quadraticCurveTo(-W/2, H/2, -W/2, H/2 - r);
  outer.lineTo(-W/2, -H/2 + r);
  outer.quadraticCurveTo(-W/2, -H/2, -W/2 + r, -H/2);

  // ── EYEBROW WINDOW: Use landmarks if available ──
  if (faceLandmarks && faceLandmarks.length > 0) {
    // Use actual eyebrow landmarks for left eyebrow
    const leftBrowPoints = LEFT_EYEBROW_INDICES.map(i => faceLandmarks[i]).filter(Boolean);
    if (leftBrowPoints.length >= 5) {
      const window = createWindowFromLandmarks(leftBrowPoints, W, H);
      outer.holes.push(window);
    } else {
      // Fallback to parametric shape
      const window = createParametricEyebrowWindow(params);
      outer.holes.push(window);
    }
  } else {
    // No landmarks - use parametric shape
    const window = createParametricEyebrowWindow(params);
    outer.holes.push(window);
  }

  // ── NOSE NOTCH ──
  const notch = new THREE.Path();
  notch.moveTo(-4, -H/2);
  notch.lineTo(0, -H/2 + 5);
  notch.lineTo(4, -H/2);
  notch.closePath();
  outer.holes.push(notch);

  // ── EXTRUDE ──
  const geo = new THREE.ExtrudeGeometry(outer, {
    steps: 1,
    depth: D,
    bevelEnabled: true,
    bevelThickness: 0.3,
    bevelSize: 0.3,
    bevelSegments: 2,
  });

  geo.center();
  geo.computeVertexNormals();

  return {
    stencilMesh: geo,
    moldMesh: geo,
  };
}

/**
 * Creates eyebrow window from actual face landmarks
 * Converts normalized coordinates to stencil coordinates
 */
function createWindowFromLandmarks(
  landmarks: { x: number; y: number; z: number }[],
  frameW: number,
  frameH: number
): THREE.Path {
  // Convert normalized coordinates (0-1) to stencil coordinates (mm)
  // The landmarks are in normalized screen space, we need to scale them
  
  // Find bounding box of landmarks
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  landmarks.forEach(p => {
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  });
  
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;
  
  // Scale to fit in stencil (leave margin)
  const scaleX = (frameW * 0.6) / rangeX;
  const scaleY = (frameH * 0.5) / rangeY;
  const scale = Math.min(scaleX, scaleY);
  
  // Create path from landmarks
  const path = new THREE.Path();
  
  // Convert landmarks to stencil coordinates
  const points = landmarks.map(p => ({
    x: (p.x - centerX) * scale,
    y: -(p.y - centerY) * scale, // Flip Y axis
  }));
  
  // Start at first point
  path.moveTo(points[0].x, points[0].y);
  
  // Use bezier curves for smooth shape
  if (points.length >= 4) {
    // Use cubic bezier through points
    for (let i = 1; i < points.length - 2; i++) {
      const p0 = points[i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || points[i + 1];
      
      path.bezierCurveTo(
        p1.x, p1.y,
        p2.x, p2.y,
        (p2.x + p3.x) / 2, (p2.y + p3.y) / 2
      );
    }
    
    // Close the shape
    const last = points[points.length - 1];
    const first = points[0];
    path.bezierCurveTo(
      last.x, last.y,
      first.x, first.y,
      first.x, first.y
    );
  } else {
    // Simple line through points
    for (let i = 1; i < points.length; i++) {
      path.lineTo(points[i].x, points[i].y);
    }
    path.closePath();
  }
  
  return path;
}

/**
 * Creates parametric eyebrow window (fallback when no landmarks)
 */
function createParametricEyebrowWindow(params: EyebrowCustomParams): THREE.Path {
  const len = (params.lengthMm || 52) * 0.5;
  const arch = (params.archHeightMm || 13.5) * 0.25;
  
  const path = new THREE.Path();
  
  // Almond shape
  path.moveTo(-len, 0);
  path.bezierCurveTo(
    -len * 0.5, -arch * 1.5,
    len * 0.5, -arch * 1.5,
    len, 0
  );
  path.bezierCurveTo(
    len * 0.5, arch * 1.5,
    -len * 0.5, arch * 1.5,
    -len, 0
  );
  
  return path;
}

/**
 * Exports BufferGeometry to Binary STL
 */
export function exportBufferGeometryToBinarySTL(geometry: THREE.BufferGeometry): ArrayBuffer {
  geometry.computeVertexNormals();

  const pos = geometry.attributes.position;
  const idx = geometry.index;

  const triCount = idx ? idx.count / 3 : pos.count / 3;
  const bufLen = 80 + 4 + triCount * 50;
  const buf = new ArrayBuffer(bufLen);
  const view = new DataView(buf);

  // Header
  const hdr = "artistiQ Eyebrow Stencil";
  for (let i = 0; i < 80; i++) {
    view.setUint8(i, i < hdr.length ? hdr.charCodeAt(i) : 0);
  }
  view.setUint32(80, triCount, true);

  let off = 84;
  const v0 = new THREE.Vector3();
  const v1 = new THREE.Vector3();
  const v2 = new THREE.Vector3();
  const cb = new THREE.Vector3();
  const ab = new THREE.Vector3();
  const normal = new THREE.Vector3();

  for (let t = 0; t < triCount; t++) {
    let i0 = t * 3, i1 = t * 3 + 1, i2 = t * 3 + 2;
    if (idx) {
      i0 = idx.getX(i0);
      i1 = idx.getX(i1);
      i2 = idx.getX(i2);
    }

    v0.set(pos.getX(i0), pos.getY(i0), pos.getZ(i0));
    v1.set(pos.getX(i1), pos.getY(i1), pos.getZ(i1));
    v2.set(pos.getX(i2), pos.getY(i2), pos.getZ(i2));

    cb.subVectors(v2, v1);
    ab.subVectors(v0, v1);
    normal.crossVectors(cb, ab).normalize();

    view.setFloat32(off, normal.x, true); off += 4;
    view.setFloat32(off, normal.y, true); off += 4;
    view.setFloat32(off, normal.z, true); off += 4;

    view.setFloat32(off, v0.x, true); off += 4;
    view.setFloat32(off, v0.y, true); off += 4;
    view.setFloat32(off, v0.z, true); off += 4;

    view.setFloat32(off, v1.x, true); off += 4;
    view.setFloat32(off, v1.y, true); off += 4;
    view.setFloat32(off, v1.z, true); off += 4;

    view.setFloat32(off, v2.x, true); off += 4;
    view.setFloat32(off, v2.y, true); off += 4;
    view.setFloat32(off, v2.z, true); off += 4;

    view.setUint16(off, 0, true); off += 2;
  }

  return buf;
}

/**
 * Downloads STL file
 */
export function downloadSTLFile(buffer: ArrayBuffer, filename: string): void {
  const blob = new Blob([buffer], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
