import { EyebrowCustomParams, BiometricMeasurements } from '@/types';
import * as THREE from 'three';

/**
 * Creates a Three.js Geometry for the Stencil + Mold negative
 */
export function createEyebrowStencil3DGeometry(
  params: EyebrowCustomParams,
  biometrics: BiometricMeasurements
): { stencilMesh: THREE.BufferGeometry; moldMesh: THREE.BufferGeometry } {
  // Stencil Base Frame Dimensions (Ergonomic curve fitting client's forehead)
  const totalWidth = biometrics.interEyebrowGapMm + params.lengthMm * 2 + 25; // mm
  const frameHeight = 55; // mm
  const frameThickness = params.stencilThicknessMm; // mm
  const curveRadius = biometrics.foreheadCurvatureRadiusMm || 78; // forehead curvature in mm

  // Build Curved Stencil Base Plane
  const segmentsX = 40;
  const segmentsY = 20;

  const stencilGeo = new THREE.PlaneGeometry(totalWidth, frameHeight, segmentsX, segmentsY);
  const posAttr = stencilGeo.attributes.position;

  // Curving the frame along Z to match forehead curvature
  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    // Z curve formula: z = radius - sqrt(radius^2 - x^2)
    const absX = Math.min(Math.abs(x), curveRadius - 1);
    const z = -(curveRadius - Math.sqrt(curveRadius * curveRadius - absX * absX)) * 0.4;
    posAttr.setZ(i, z);
  }
  stencilGeo.computeVertexNormals();

  // Create Silicone Mold Insert Box Geometry
  const moldWidth = totalWidth + 10;
  const moldHeight = frameHeight + 10;
  const moldDepth = params.moldDepthMm + frameThickness;

  const moldGeo = new THREE.BoxGeometry(moldWidth, moldHeight, moldDepth);

  return {
    stencilMesh: stencilGeo,
    moldMesh: moldGeo,
  };
}

/**
 * Converts a Three.js BufferGeometry to Binary STL ArrayBuffer
 */
export function exportBufferGeometryToBinarySTL(geometry: THREE.BufferGeometry): ArrayBuffer {
  // Ensure normals are updated
  geometry.computeVertexNormals();

  const posAttr = geometry.attributes.position;
  const indexAttr = geometry.index;
  const normalAttr = geometry.attributes.normal;

  const triangleCount = indexAttr ? indexAttr.count / 3 : posAttr.count / 3;
  const bufferLength = 80 + 4 + triangleCount * 50;
  const buffer = new ArrayBuffer(bufferLength);
  const view = new DataView(buffer);

  // 80 bytes header
  const headerStr = "artistiQ 3D Stencil & Mold Biometric Model - High Precision";
  for (let i = 0; i < 80; i++) {
    view.setUint8(i, i < headerStr.length ? headerStr.charCodeAt(i) : 32);
  }

  // 4 bytes: number of triangles
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

    // Calculate normal
    const cb = new THREE.Vector3().subVectors(v2, v1);
    const ab = new THREE.Vector3().subVectors(v0, v1);
    const normal = cb.cross(ab).normalize();

    return { normal, v0, v1, v2 };
  };

  for (let t = 0; t < triangleCount; t++) {
    const { normal, v0, v1, v2 } = getTriangleVertices(t);

    // Normal vector
    view.setFloat32(offset + 0, normal.x, true);
    view.setFloat32(offset + 4, normal.y, true);
    view.setFloat32(offset + 8, normal.z, true);

    // Vertex 1
    view.setFloat32(offset + 12, v0.x, true);
    view.setFloat32(offset + 16, v0.y, true);
    view.setFloat32(offset + 20, v0.z, true);

    // Vertex 2
    view.setFloat32(offset + 24, v1.x, true);
    view.setFloat32(offset + 28, v1.y, true);
    view.setFloat32(offset + 32, v1.z, true);

    // Vertex 3
    view.setFloat32(offset + 36, v2.x, true);
    view.setFloat32(offset + 40, v2.y, true);
    view.setFloat32(offset + 44, v2.z, true);

    // 2 bytes attribute byte count (0)
    view.setUint16(offset + 48, 0, true);

    offset += 50;
  }

  return buffer;
}

/**
 * Trigger file download of STL array buffer in browser
 */
export function downloadSTLFile(buffer: ArrayBuffer, filename: string = "artistiQ_pochoir_3d.stl"): void {
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
