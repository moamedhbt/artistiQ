import { EyebrowCustomParams, BiometricMeasurements } from '@/types';
import * as THREE from 'three';

/**
 * Creates a professional eyebrow mold for silicone casting
 * Single clean geometry - no merging that could cause issues
 */
export function createEyebrowStencil3DGeometry(
  params: EyebrowCustomParams,
  biometrics: BiometricMeasurements
): { stencilMesh: THREE.BufferGeometry; moldMesh: THREE.BufferGeometry } {
  
  // ── DIMENSIONS (mm) ──
  const frameW = 70;
  const frameH = 38;
  const frameDepth = params.stencilThicknessMm || 2.5;
  const moldWall = 4;
  const moldBase = 5;
  const moldR = 8;

  // ── 1. STENCIL (the positive - what the client receives) ──
  const stencilShape = createRoundedRect(frameW, frameH, 6);
  
  // Eyebrow window cutout
  const eyebrowWindow = createEyebrowWindow(params);
  stencilShape.holes.push(eyebrowWindow);

  const stencilGeo = new THREE.ExtrudeGeometry(stencilShape, {
    steps: 1,
    depth: frameDepth,
    bevelEnabled: true,
    bevelThickness: 0.3,
    bevelSize: 0.3,
    bevelSegments: 2,
  });
  stencilGeo.center();

  // Curve to fit forehead
  applyForeheadCurvature(stencilGeo, biometrics.foreheadCurvatureRadiusMm || 78);
  stencilGeo.computeVertexNormals();

  // ── 2. MOLD (the negative - for silicone casting) ──
  // Create mold as a single shape with cavity
  const moldW = frameW + moldWall * 2;
  const moldH = frameH + moldWall * 2;
  const moldD = moldBase + frameDepth + 3;

  // Outer mold shape
  const moldOuter = createRoundedRect(moldW, moldH, moldR);

  // Inner cavity (where the stencil sits) - slightly smaller for tolerance
  const cavityW = frameW - 0.3;
  const cavityH = frameH - 0.3;
  const moldInner = createRoundedRect(cavityW, cavityH, 5.5);
  moldOuter.holes.push(moldInner);

  // Eyebrow ridge (creates the window in the stencil)
  const eyebrowRidge = createEyebrowRidge(params);
  moldOuter.holes.push(eyebrowRidge);

  const moldGeo = new THREE.ExtrudeGeometry(moldOuter, {
    steps: 1,
    depth: moldD,
    bevelEnabled: true,
    bevelThickness: 1,
    bevelSize: 1,
    bevelSegments: 3,
  });
  moldGeo.center();

  // Position mold behind stencil
  const moldPos = moldGeo.attributes.position;
  for (let i = 0; i < moldPos.count; i++) {
    moldPos.setZ(i, moldPos.getZ(i) - moldD / 2 - frameDepth / 2 - 3);
  }
  moldGeo.computeVertexNormals();

  return {
    stencilMesh: stencilGeo,
    moldMesh: moldGeo,
  };
}

/**
 * Creates a rounded rectangle shape
 */
function createRoundedRect(width: number, height: number, radius: number): THREE.Shape {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  const r = Math.min(radius, width / 2, height / 2);

  shape.moveTo(x + r, y);
  shape.lineTo(x + width - r, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + r);
  shape.lineTo(x + width, y + height - r);
  shape.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  shape.lineTo(x + r, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);

  return shape;
}

/**
 * Creates the eyebrow window cutout for the stencil
 */
function createEyebrowWindow(params: EyebrowCustomParams): THREE.Path {
  const len = (params.lengthMm || 52) * 0.5;
  const arch = (params.archHeightMm || 13.5) * 0.25;
  const thick = (params.thicknessMm || 6.5) * 0.75;

  const hole = new THREE.Path();
  
  // Simple eyebrow shape - smooth curves
  hole.moveTo(-len / 2, 0);
  
  // Top edge
  hole.bezierCurveTo(
    -len / 3, -arch * 0.8,
    0, -arch,
    len / 3, -arch * 0.5
  );
  
  // Tail
  hole.bezierCurveTo(
    len / 2, -arch * 0.2,
    len / 2, thick / 3,
    len / 3, thick / 2
  );
  
  // Bottom edge
  hole.bezierCurveTo(
    0, thick / 1.5,
    -len / 3, thick / 2,
    -len / 2, 0
  );

  return hole;
}

/**
 * Creates the eyebrow ridge for the mold (negative of the window)
 */
function createEyebrowRidge(params: EyebrowCustomParams): THREE.Path {
  // Slightly smaller than the window for tolerance
  const len = (params.lengthMm || 52) * 0.47;
  const arch = (params.archHeightMm || 13.5) * 0.23;
  const thick = (params.thicknessMm || 6.5) * 0.7;

  const ridge = new THREE.Path();
  
  ridge.moveTo(-len / 2, 0);
  ridge.bezierCurveTo(
    -len / 3, -arch * 0.7,
    0, -arch * 0.9,
    len / 3, -arch * 0.4
  );
  ridge.bezierCurveTo(
    len / 2, -arch * 0.1,
    len / 2, thick / 3,
    len / 3, thick / 2
  );
  ridge.bezierCurveTo(
    0, thick / 1.4,
    -len / 3, thick / 2,
    -len / 2, 0
  );

  return ridge;
}

/**
 * Applies forehead curvature to geometry
 */
function applyForeheadCurvature(geo: THREE.BufferGeometry, radius: number): void {
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const px = pos.getX(i);
    const absX = Math.min(Math.abs(px), radius - 1);
    const z = -(radius - Math.sqrt(radius * radius - absX * absX)) * 0.12;
    pos.setZ(i, pos.getZ(i) + z);
  }
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
  const hdr = "artistiQ Eyebrow Mold STL";
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
