import { EyebrowCustomParams, BiometricMeasurements } from '@/types';
import * as THREE from 'three';

/**
 * Creates a professional 3D printable eyebrow stencil
 * Simple, clean geometry - a flat plate with an eyebrow-shaped window
 */
export function createEyebrowStencil3DGeometry(
  params: EyebrowCustomParams,
  biometrics: BiometricMeasurements
): { stencilMesh: THREE.BufferGeometry; moldMesh: THREE.BufferGeometry } {
  
  // ── DIMENSIONS (mm) ──
  const W = 80;  // Width
  const H = 40;  // Height
  const D = 2;   // Thickness

  // ── OUTER SHAPE: Rounded rectangle ──
  const outer = new THREE.Shape();
  const r = 5;
  outer.moveTo(-W/2 + r, -H/2);
  outer.lineTo(W/2 - r, -H/2);
  outer.quadraticCurveTo(W/2, -H/2, W/2, -H/2 + r);
  outer.lineTo(W/2, H/2 - r);
  outer.quadraticCurveTo(W/2, H/2, W/2 - r, H/2);
  outer.lineTo(-W/2 + r, H/2);
  outer.quadraticCurveTo(-W/2, H/2, -W/2, H/2 - r);
  outer.lineTo(-W/2, -H/2 + r);
  outer.quadraticCurveTo(-W/2, -H/2, -W/2 + r, -H/2);

  // ── EYEBROW WINDOW: Simple almond shape ──
  const len = (params.lengthMm || 52) * 0.5;
  const arch = (params.archHeightMm || 13.5) * 0.25;
  
  const window = new THREE.Path();
  
  // Simple almond/eye shape for the eyebrow window
  // This creates a clean, recognizable stencil window
  window.moveTo(-len, 0);
  
  // Top curve
  window.bezierCurveTo(
    -len * 0.5, -arch * 1.5,
    len * 0.5, -arch * 1.5,
    len, 0
  );
  
  // Bottom curve
  window.bezierCurveTo(
    len * 0.5, arch * 1.5,
    -len * 0.5, arch * 1.5,
    -len, 0
  );
  
  outer.holes.push(window);

  // ── NOSE NOTCH: Small triangle at bottom ──
  const notch = new THREE.Path();
  notch.moveTo(-3, -H/2);
  notch.lineTo(0, -H/2 + 4);
  notch.lineTo(3, -H/2);
  notch.closePath();
  outer.holes.push(notch);

  // ── EXTRUDE ──
  const geo = new THREE.ExtrudeGeometry(outer, {
    steps: 1,
    depth: D,
    bevelEnabled: false,
  });

  geo.center();
  geo.computeVertexNormals();

  return {
    stencilMesh: geo,
    moldMesh: geo,
  };
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
