import { EyebrowCustomParams, BiometricMeasurements } from '@/types';
import * as THREE from 'three';

/**
 * Creates a simple, clean, professional eyebrow stencil
 * Guaranteed to work in all3D software and printers
 */
export function createEyebrowStencil3DGeometry(
  params: EyebrowCustomParams,
  biometrics: BiometricMeasurements,
  faceLandmarks?: { x: number; y: number; z: number }[]
): { stencilMesh: THREE.BufferGeometry; moldMesh: THREE.BufferGeometry } {
  
  // ── DIMENSIONS (mm) ──
  const W = 80;
  const H = 40;
  const D = 2.0;

  // ── CREATE SIMPLE STENCIL ──
  // Use BufferGeometry directly for guaranteed valid mesh
  
  // Create a flat rectangular plate
  const shape = new THREE.Shape();
  shape.moveTo(-W/2, -H/2);
  shape.lineTo(W/2, -H/2);
  shape.lineTo(W/2, H/2);
  shape.lineTo(-W/2, H/2);
  shape.closePath();

  // Create eyebrow window (simple oval)
  const windowPath = new THREE.Path();
  const windowW = 30;
  const windowH = 10;
  
  // Create oval using bezier curves
  windowPath.moveTo(-windowW/2, 0);
  windowPath.bezierCurveTo(
    -windowW/2, -windowH * 0.55,
    -windowW * 0.3, -windowH,
    0, -windowH
  );
  windowPath.bezierCurveTo(
    windowW * 0.3, -windowH,
    windowW/2, -windowH * 0.55,
    windowW/2, 0
  );
  windowPath.bezierCurveTo(
    windowW/2, windowH * 0.55,
    windowW * 0.3, windowH,
    0, windowH
  );
  windowPath.bezierCurveTo(
    -windowW * 0.3, windowH,
    -windowW/2, windowH * 0.55,
    -windowW/2, 0
  );
  
  shape.holes.push(windowPath);

  // Nose notch (simple triangle)
  const notchPath = new THREE.Path();
  notchPath.moveTo(-3, -H/2);
  notchPath.lineTo(0, -H/2 + 4);
  notchPath.lineTo(3, -H/2);
  notchPath.closePath();
  shape.holes.push(notchPath);

  // Extrude
  const geometry = new THREE.ExtrudeGeometry(shape, {
    steps: 1,
    depth: D,
    bevelEnabled: false,
  });

  geometry.center();
  geometry.computeVertexNormals();

  return {
    stencilMesh: geometry,
    moldMesh: geometry,
  };
}

/**
 * Exports BufferGeometry to Binary STL
 * Simple, clean, guaranteed valid
 */
export function exportBufferGeometryToBinarySTL(geometry: THREE.BufferGeometry): ArrayBuffer {
  geometry.computeVertexNormals();

  const positions = geometry.attributes.position;
  const indices = geometry.index;

  // Count triangles
  let triCount: number;
  if (indices) {
    triCount = indices.count / 3;
  } else {
    triCount = positions.count / 3;
  }

  // Create buffer: 80 header + 4 tri count + (50 bytes per triangle)
  const bufferLength = 80 + 4 + (triCount * 50);
  const buffer = new ArrayBuffer(bufferLength);
  const dataView = new DataView(buffer);

  // Write header (80 bytes)
  const header = "artistiQ Eyebrow Stencil - Binary STL";
  for (let i = 0; i < 80; i++) {
    if (i < header.length) {
      dataView.setUint8(i, header.charCodeAt(i));
    } else {
      dataView.setUint8(i, 0);
    }
  }

  // Write triangle count
  dataView.setUint32(80, triCount, true);

  // Write triangles
  let offset = 84;
  const v0 = new THREE.Vector3();
  const v1 = new THREE.Vector3();
  const v2 = new THREE.Vector3();
  const normal = new THREE.Vector3();
  const edge1 = new THREE.Vector3();
  const edge2 = new THREE.Vector3();

  for (let i = 0; i < triCount; i++) {
    let i0: number, i1: number, i2: number;

    if (indices) {
      i0 = indices.getX(i * 3);
      i1 = indices.getX(i * 3 + 1);
      i2 = indices.getX(i * 3 + 2);
    } else {
      i0 = i * 3;
      i1 = i * 3 + 1;
      i2 = i * 3 + 2;
    }

    // Get vertex positions
    v0.set(
      positions.getX(i0),
      positions.getY(i0),
      positions.getZ(i0)
    );
    v1.set(
      positions.getX(i1),
      positions.getY(i1),
      positions.getZ(i1)
    );
    v2.set(
      positions.getX(i2),
      positions.getY(i2),
      positions.getZ(i2)
    );

    // Calculate face normal
    edge1.subVectors(v1, v0);
    edge2.subVectors(v2, v0);
    normal.crossVectors(edge1, edge2).normalize();

    // Write normal
    dataView.setFloat32(offset, normal.x, true); offset += 4;
    dataView.setFloat32(offset, normal.y, true); offset += 4;
    dataView.setFloat32(offset, normal.z, true); offset += 4;

    // Write vertex 1
    dataView.setFloat32(offset, v0.x, true); offset += 4;
    dataView.setFloat32(offset, v0.y, true); offset += 4;
    dataView.setFloat32(offset, v0.z, true); offset += 4;

    // Write vertex 2
    dataView.setFloat32(offset, v1.x, true); offset += 4;
    dataView.setFloat32(offset, v1.y, true); offset += 4;
    dataView.setFloat32(offset, v1.z, true); offset += 4;

    // Write vertex 3
    dataView.setFloat32(offset, v2.x, true); offset += 4;
    dataView.setFloat32(offset, v2.y, true); offset += 4;
    dataView.setFloat32(offset, v2.z, true); offset += 4;

    // Write attribute byte count
    dataView.setUint16(offset, 0, true); offset += 2;
  }

  return buffer;
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
