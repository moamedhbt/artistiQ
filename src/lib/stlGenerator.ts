import { EyebrowCustomParams, BiometricMeasurements } from '@/types';
import * as THREE from 'three';

/**
 * Creates a professional 3D printable eyebrow stencil
 * Clean, simple geometry that actually looks like a real stencil
 */
export function createEyebrowStencil3DGeometry(
  params: EyebrowCustomParams,
  biometrics: BiometricMeasurements
): { stencilMesh: THREE.BufferGeometry; moldMesh: THREE.BufferGeometry } {
  
  // ── DIMENSIONS (mm) ──
  const frameW = 80;
  const frameH = 45;
  const frameDepth = params.stencilThicknessMm || 2.0;

  // ── CREATE STENCIL SHAPE ──
  const shape = new THREE.Shape();
  
  // Outer rounded rectangle
  const r = 6;
  shape.moveTo(-frameW/2 + r, -frameH/2);
  shape.lineTo(frameW/2 - r, -frameH/2);
  shape.quadraticCurveTo(frameW/2, -frameH/2, frameW/2, -frameH/2 + r);
  shape.lineTo(frameW/2, frameH/2 - r);
  shape.quadraticCurveTo(frameW/2, frameH/2, frameW/2 - r, frameH/2);
  shape.lineTo(-frameW/2 + r, frameH/2);
  shape.quadraticCurveTo(-frameW/2, frameH/2, -frameW/2, frameH/2 - r);
  shape.lineTo(-frameW/2, -frameH/2 + r);
  shape.quadraticCurveTo(-frameW/2, -frameH/2, -frameW/2 + r, -frameH/2);

  // ── EYEBROW WINDOW (the key feature) ──
  const eyebrowPath = createNaturalEyebrowShape(params);
  shape.holes.push(eyebrowPath);

  // ── NOSE ALIGNMENT NOTCH ──
  const noseNotch = new THREE.Path();
  noseNotch.moveTo(-4, -frameH/2);
  noseNotch.lineTo(0, -frameH/2 + 5);
  noseNotch.lineTo(4, -frameH/2);
  noseNotch.closePath();
  shape.holes.push(noseNotch);

  // ── EXTRUDE ──
  const geometry = new THREE.ExtrudeGeometry(shape, {
    steps: 1,
    depth: frameDepth,
    bevelEnabled: true,
    bevelThickness: 0.3,
    bevelSize: 0.3,
    bevelSegments: 2,
  });

  geometry.center();
  geometry.computeVertexNormals();

  return {
    stencilMesh: geometry,
    moldMesh: geometry, // Same - we only need the stencil
  };
}

/**
 * Creates a natural eyebrow shape using smooth curves
 * This creates a realistic eyebrow window cutout
 */
function createNaturalEyebrowShape(params: EyebrowCustomParams): THREE.Path {
  const len = (params.lengthMm || 52) * 0.6;
  const arch = (params.archHeightMm || 13.5) * 0.35;
  const thick = (params.thicknessMm || 6.5) * 0.9;

  const path = new THREE.Path();
  
  // Start at eyebrow head (inner corner near nose)
  const startX = -len / 2;
  const startY = 0;
  
  path.moveTo(startX, startY);
  
  // Top edge: smooth arch from head to tail
  // Using multiple bezier segments for natural curve
  path.bezierCurveTo(
    startX + len * 0.15, -arch * 0.6,   // Control 1: slight rise
    startX + len * 0.35, -arch * 1.0,   // Control 2: approaching peak
    startX + len * 0.5, -arch * 0.9     // End: near peak
  );
  
  path.bezierCurveTo(
    startX + len * 0.65, -arch * 0.8,   // Control 1: past peak
    startX + len * 0.85, -arch * 0.3,   // Control 2: descending
    startX + len, -arch * 0.1           // End: tail tip
  );
  
  // Tail tip: small curve
  path.bezierCurveTo(
    startX + len + 2, 0,                // Control: round the tip
    startX + len + 1, thick * 0.3,      // Control: curve back
    startX + len * 0.9, thick * 0.5     // End: bottom of tail
  );
  
  // Bottom edge: smooth curve from tail back to head
  path.bezierCurveTo(
    startX + len * 0.7, thick * 0.7,    // Control 1
    startX + len * 0.4, thick * 0.8,    // Control 2
    startX + len * 0.2, thick * 0.6     // End: mid-bottom
  );
  
  path.bezierCurveTo(
    startX + len * 0.05, thick * 0.4,   // Control 1
    startX - 2, thick * 0.2,            // Control 2
    startX, startY                      // End: back to start
  );

  return path;
}

/**
 * Exports BufferGeometry to Binary STL
 * Clean, valid STL format
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
  const hdr = "artistiQ Eyebrow Stencil";
  for (let i = 0; i < 80; i++) {
    view.setUint8(i, i < hdr.length ? hdr.charCodeAt(i) : 0);
  }
  view.setUint32(80, triCount, true);

  let off = 84;

  for (let t = 0; t < triCount; t++) {
    let i0 = t * 3, i1 = t * 3 + 1, i2 = t * 3 + 2;
    if (idx) {
      i0 = idx.getX(i0);
      i1 = idx.getX(i1);
      i2 = idx.getX(i2);
    }

    // Get face normal (average of vertex normals)
    const nx = (norm.getX(i0) + norm.getX(i1) + norm.getX(i2)) / 3;
    const ny = (norm.getY(i0) + norm.getY(i1) + norm.getY(i2)) / 3;
    const nz = (norm.getZ(i0) + norm.getZ(i1) + norm.getZ(i2)) / 3;
    const len = Math.sqrt(nx*nx + ny*ny + nz*nz) || 1;

    // Normal
    view.setFloat32(off, nx/len, true); off += 4;
    view.setFloat32(off, ny/len, true); off += 4;
    view.setFloat32(off, nz/len, true); off += 4;

    // Vertex 1
    view.setFloat32(off, pos.getX(i0), true); off += 4;
    view.setFloat32(off, pos.getY(i0), true); off += 4;
    view.setFloat32(off, pos.getZ(i0), true); off += 4;

    // Vertex 2
    view.setFloat32(off, pos.getX(i1), true); off += 4;
    view.setFloat32(off, pos.getY(i1), true); off += 4;
    view.setFloat32(off, pos.getZ(i1), true); off += 4;

    // Vertex 3
    view.setFloat32(off, pos.getX(i2), true); off += 4;
    view.setFloat32(off, pos.getY(i2), true); off += 4;
    view.setFloat32(off, pos.getZ(i2), true); off += 4;

    // Attribute byte count
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
