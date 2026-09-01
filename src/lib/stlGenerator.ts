import { EyebrowCustomParams, BiometricMeasurements } from '@/types';
import * as THREE from 'three';

/**
 * Creates a realistic eyebrow stencil geometry
 * Single clean geometry - no merging that could cause issues
 */
export function createEyebrowStencil3DGeometry(
  params: EyebrowCustomParams,
  biometrics: BiometricMeasurements
): { stencilMesh: THREE.BufferGeometry; moldMesh: THREE.BufferGeometry } {
  
  // ── STENCIL: Rounded rectangle with eyebrow cutout ──
  const frameW = 68;
  const frameH = 38;
  const depth = params.stencilThicknessMm || 2.5;
  const r = 6;

  const shape = new THREE.Shape();
  shape.moveTo(-frameW/2 + r, -frameH/2);
  shape.lineTo(frameW/2 - r, -frameH/2);
  shape.quadraticCurveTo(frameW/2, -frameH/2, frameW/2, -frameH/2 + r);
  shape.lineTo(frameW/2, frameH/2 - r);
  shape.quadraticCurveTo(frameW/2, frameH/2, frameW/2 - r, frameH/2);
  shape.lineTo(-frameW/2 + r, frameH/2);
  shape.quadraticCurveTo(-frameW/2, frameH/2, -frameW/2, frameH/2 - r);
  shape.lineTo(-frameW/2, -frameH/2 + r);
  shape.quadraticCurveTo(-frameW/2, -frameH/2, -frameW/2 + r, -frameH/2);

  // Eyebrow cutout
  const len = (params.lengthMm || 52) * 0.55;
  const arch = (params.archHeightMm || 13.5) * 0.3;
  const thick = (params.thicknessMm || 6.5) * 0.85;

  const hole = new THREE.Path();
  hole.moveTo(-len/2, 0);
  hole.bezierCurveTo(-len/4, -arch, len/6, -arch*1.2, len/3, -arch*0.3);
  hole.bezierCurveTo(len/2.5, thick/2, len/4, thick/2, 0, thick/3);
  hole.bezierCurveTo(-len/4, thick/2, -len/3, thick/3, -len/2, 0);
  shape.holes.push(hole);

  const stencilGeo = new THREE.ExtrudeGeometry(shape, {
    steps: 1,
    depth: depth,
    bevelEnabled: true,
    bevelThickness: 0.5,
    bevelSize: 0.5,
    bevelSegments: 2,
  });
  stencilGeo.center();

  // Curve to fit forehead
  const curveR = biometrics.foreheadCurvatureRadiusMm || 78;
  const pos = stencilGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const px = pos.getX(i);
    const ax = Math.min(Math.abs(px), curveR - 1);
    const z = -(curveR - Math.sqrt(curveR * curveR - ax * ax)) * 0.15;
    pos.setZ(i, pos.getZ(i) + z);
  }
  stencilGeo.computeVertexNormals();

  // ── MOLD: Simple box with cavity ──
  const moldW = frameW + 12;
  const moldH = frameH + 12;
  const moldD = (params.moldDepthMm || 4) + depth + 2;

  const moldGeo = new THREE.BoxGeometry(moldW, moldH, moldD);
  
  // Create cavity by modifying vertices
  const moldPos = moldGeo.attributes.position;
  const cavityW = frameW * 0.9;
  const cavityH = frameH * 0.9;
  const cavityD = moldD * 0.6;

  for (let i = 0; i < moldPos.count; i++) {
    const x = moldPos.getX(i);
    const y = moldPos.getY(i);
    const z = moldPos.getZ(i);

    // Only push in the top face
    if (z > moldD/2 - 1) {
      const inCavityX = Math.abs(x) < cavityW/2;
      const inCavityY = Math.abs(y) < cavityH/2;
      if (inCavityX && inCavityY) {
        moldPos.setZ(i, z - cavityD);
      }
    }
  }
  moldGeo.computeVertexNormals();

  // Position mold behind stencil
  for (let i = 0; i < moldPos.count; i++) {
    moldPos.setZ(i, moldPos.getZ(i) - moldD/2 - depth/2 - 1);
  }

  return {
    stencilMesh: stencilGeo,
    moldMesh: moldGeo,
  };
}

/**
 * Clean Binary STL export
 */
export function exportBufferGeometryToBinarySTL(geometry: THREE.BufferGeometry): ArrayBuffer {
  geometry.computeVertexNormals();

  const pos = geometry.attributes.position;
  const norm = geometry.attributes.normal;
  const idx = geometry.index;

  const triCount = idx ? idx.count / 3 : pos.count / 3;
  const bufLen = 80 + 4 + triCount * 50;
  const buf = new ArrayBuffer(bufLen);
  const view = new DataView(buf);

  // Header
  const hdr = "artistiQ Personalized Eyebrow Stencil Mold";
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
