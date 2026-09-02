import { EyebrowCustomParams, BiometricMeasurements } from '@/types';
import * as THREE from 'three';

/**
 * Creates a 3D printable eyebrow stencil
 * The STL IS the final product - printed directly in flexible material (TPU/silicone)
 */
export function createEyebrowStencil3DGeometry(
  params: EyebrowCustomParams,
  biometrics: BiometricMeasurements
): { stencilMesh: THREE.BufferGeometry; moldMesh: THREE.BufferGeometry } {
  
  // ── DIMENSIONS (mm) ──
  const frameW = 75;
  const frameH = 40;
  const frameDepth = params.stencilThicknessMm || 2.0;
  const cornerR = 8;

  // ── STENCIL SHAPE ──
  const stencilShape = createRoundedRect(frameW, frameH, cornerR);
  
  // Eyebrow window cutout (the key feature)
  const eyebrowWindow = createEyebrowWindow(params);
  stencilShape.holes.push(eyebrowWindow);

  // Nose alignment notch
  const noseNotch = createNoseNotch();
  stencilShape.holes.push(noseNotch);

  // Create geometry
  const stencilGeo = new THREE.ExtrudeGeometry(stencilShape, {
    steps: 1,
    depth: frameDepth,
    bevelEnabled: true,
    bevelThickness: 0.4,
    bevelSize: 0.4,
    bevelSegments: 3,
  });
  stencilGeo.center();

  // Curve to fit forehead
  applyForeheadCurvature(stencilGeo, biometrics.foreheadCurvatureRadiusMm || 78);
  stencilGeo.computeVertexNormals();

  // For compatibility, moldMesh is the same as stencilMesh (we only need the stencil)
  return {
    stencilMesh: stencilGeo,
    moldMesh: stencilGeo,
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
 * Creates the eyebrow window cutout
 * This is the exact shape of the eyebrow - the key feature of the stencil
 */
function createEyebrowWindow(params: EyebrowCustomParams): THREE.Path {
  const len = (params.lengthMm || 52) * 0.55;
  const arch = (params.archHeightMm || 13.5) * 0.3;
  const thick = (params.thicknessMm || 6.5) * 0.8;

  const hole = new THREE.Path();
  
  // Start at eyebrow head (inner corner near nose)
  hole.moveTo(-len / 2, 0);
  
  // Top edge: head → arch → tail
  // Smooth bezier curve following natural eyebrow shape
  hole.bezierCurveTo(
    -len / 3, -arch * 0.9,    // Control point 1: rises toward arch
    len / 6, -arch * 1.1,     // Control point 2: near the peak
    len / 3, -arch * 0.4      // End: past the arch, starting to descend
  );
  
  // Tail: curves down and back
  hole.bezierCurveTo(
    len / 2, -arch * 0.1,     // Control: near the tail tip
    len / 2, thick / 4,       // Control: curves back
    len / 3, thick / 2        // End: bottom of tail
  );
  
  // Bottom edge: tail → head
  hole.bezierCurveTo(
    len / 6, thick * 0.7,     // Control: follows bottom curve
    -len / 4, thick / 2,      // Control: toward head
    -len / 2, 0               // End: back to start
  );

  return hole;
}

/**
 * Creates nose alignment notch
 * Small triangular notch at the bottom center for positioning
 */
function createNoseNotch(): THREE.Path {
  const notch = new THREE.Path();
  const w = 5;
  const h = 3;

  notch.moveTo(-w / 2, 0);
  notch.lineTo(0, -h);
  notch.lineTo(w / 2, 0);
  notch.closePath();

  return notch;
}

/**
 * Applies forehead curvature to geometry
 * Makes the stencil fit the natural curve of the forehead
 */
function applyForeheadCurvature(geo: THREE.BufferGeometry, radius: number): void {
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const px = pos.getX(i);
    const absX = Math.min(Math.abs(px), radius - 1);
    const z = -(radius - Math.sqrt(radius * radius - absX * absX)) * 0.15;
    pos.setZ(i, pos.getZ(i) + z);
  }
}

/**
 * Exports BufferGeometry to Binary STL
 * Valid STL format compatible with all3D software and printers
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
  const hdr = "artistiQ Eyebrow Stencil - 3D Printable";
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
