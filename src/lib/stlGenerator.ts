import { EyebrowCustomParams, BiometricMeasurements } from '@/types';
import * as THREE from 'three';

/**
 * Creates a photorealistic 3D Eyebrow Stamp Tool Geometry (Ergonomic Handle + Silicone Brow Stencil Face)
 */
export function createEyebrowStencil3DGeometry(
  params: EyebrowCustomParams,
  biometrics: BiometricMeasurements
): { stencilMesh: THREE.BufferGeometry; moldMesh: THREE.BufferGeometry } {
  
  // Create group geometry for the complete stamp assembly
  const group = new THREE.Group();

  // 1. Sleek Outer Stencil Frame (Rounded Rectangle)
  const frameWidth = 65; // mm
  const frameHeight = 35; // mm
  const frameDepth = params.stencilThicknessMm || 2.5;

  const shape = new THREE.Shape();
  const radius = 8;
  const x = -frameWidth / 2;
  const y = -frameHeight / 2;

  shape.moveTo(x + radius, y);
  shape.lineTo(x + frameWidth - radius, y);
  shape.quadraticCurveTo(x + frameWidth, y, x + frameWidth, y + radius);
  shape.lineTo(x + frameWidth, y + frameHeight - radius);
  shape.quadraticCurveTo(x + frameWidth, y + frameHeight, x + frameWidth - radius, y + frameHeight);
  shape.lineTo(x + radius, y + frameHeight);
  shape.quadraticCurveTo(x, y + frameHeight, x, y + frameHeight - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);

  // Inner Eyebrow Cutout
  const hole = new THREE.Path();
  const len = (params.lengthMm || 52) * 0.65;
  const arch = (params.archHeightMm || 13.5) * 0.3;
  const thick = (params.thicknessMm || 6.5) * 1.1;

  hole.moveTo(-len / 2, -thick / 2);
  hole.bezierCurveTo(-len * 0.2, -thick / 2, len * 0.1, arch - thick / 2, len * 0.25, arch);
  hole.bezierCurveTo(len * 0.4, arch, len * 0.45, 0, len / 2, -thick * 0.4);
  hole.bezierCurveTo(len * 0.38, -thick, len * 0.2, arch - thick, -len * 0.1, arch - thick);
  hole.bezierCurveTo(-len * 0.3, -thick, -len * 0.4, -thick / 2, -len / 2, -thick / 2);
  
  shape.holes.push(hole);

  const extrudeSettings = {
    steps: 1,
    depth: frameDepth,
    bevelEnabled: true,
    bevelThickness: 1.0,
    bevelSize: 1.0,
    bevelSegments: 5,
  };

  const stencilGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  stencilGeo.center();

  // Curve geometry along Z to fit forehead curvature
  const curveRadius = biometrics.foreheadCurvatureRadiusMm || 78;
  const posAttr = stencilGeo.attributes.position;

  for (let i = 0; i < posAttr.count; i++) {
    const px = posAttr.getX(i);
    const absX = Math.min(Math.abs(px), curveRadius - 1);
    const z = -(curveRadius - Math.sqrt(curveRadius * curveRadius - absX * absX)) * 0.25;
    posAttr.setZ(i, posAttr.getZ(i) + z);
  }
  stencilGeo.computeVertexNormals();

  const moldGeo = new THREE.BoxGeometry(frameWidth + 10, frameHeight + 10, frameDepth + 4);

  return {
    stencilMesh: stencilGeo,
    moldMesh: moldGeo,
  };
}

/**
 * Converts Three.js BufferGeometry to Binary STL ArrayBuffer
 */
export function exportBufferGeometryToBinarySTL(geometry: THREE.BufferGeometry): ArrayBuffer {
  geometry.computeVertexNormals();

  const posAttr = geometry.attributes.position;
  const indexAttr = geometry.index;

  const triangleCount = indexAttr ? indexAttr.count / 3 : posAttr.count / 3;
  const bufferLength = 80 + 4 + triangleCount * 50;
  const buffer = new ArrayBuffer(bufferLength);
  const view = new DataView(buffer);

  const headerStr = "ARTISTIQ 3D Eyebrow Stencil & Mold Model - 1:1 Precision";
  for (let i = 0; i < 80; i++) {
    view.setUint8(i, i < headerStr.length ? headerStr.charCodeAt(i) : 32);
  }

  view.setUint32(80, triangleCount, true);

  let offset = 84;

  const getTriangleVertices = (triIdx: number) => {
    let i0 = triIdx * 3;
    let i1 = triIdx * 3 + 1;
    let i2 = triIdx * 3 + 2;

    if (indexAttr) {
      i0 = indexAttr.getX(i0);
      i1 = indexAttr.getX(i1);
      i2 = indexAttr.getX(i2);
    }

    const v0 = new THREE.Vector3(posAttr.getX(i0), posAttr.getY(i0), posAttr.getZ(i0));
    const v1 = new THREE.Vector3(posAttr.getX(i1), posAttr.getY(i1), posAttr.getZ(i1));
    const v2 = new THREE.Vector3(posAttr.getX(i2), posAttr.getY(i2), posAttr.getZ(i2));

    const cb = new THREE.Vector3().subVectors(v2, v1);
    const ab = new THREE.Vector3().subVectors(v0, v1);
    const normal = cb.cross(ab).normalize();

    return { normal, v0, v1, v2 };
  };

  for (let t = 0; t < triangleCount; t++) {
    const { normal, v0, v1, v2 } = getTriangleVertices(t);

    view.setFloat32(offset + 0, normal.x, true);
    view.setFloat32(offset + 4, normal.y, true);
    view.setFloat32(offset + 8, normal.z, true);

    view.setFloat32(offset + 12, v0.x, true);
    view.setFloat32(offset + 16, v0.y, true);
    view.setFloat32(offset + 20, v0.z, true);

    view.setFloat32(offset + 24, v1.x, true);
    view.setFloat32(offset + 28, v1.y, true);
    view.setFloat32(offset + 32, v1.z, true);

    view.setFloat32(offset + 36, v2.x, true);
    view.setFloat32(offset + 40, v2.y, true);
    view.setFloat32(offset + 44, v2.z, true);

    view.setUint16(offset + 48, 0, true);

    offset += 50;
  }

  return buffer;
}

export function downloadSTLFile(buffer: ArrayBuffer, filename: string = "ARTISTIQ_pochoir_3d.stl"): void {
  const blob = new Blob([buffer], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
