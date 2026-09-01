import { EyebrowCustomParams, BiometricMeasurements } from '@/types';
import * as THREE from 'three';

/**
 * Creates a realistic 3D Eyebrow Stamp/Mold Geometry
 * - Outer frame: ergonomic rounded rectangle with grip texture
 * - Inner cutout: precise eyebrow shape based on user's biometric measurements
 * - Curved to fit forehead contour
 * - Includes handle for easy use
 */
export function createEyebrowStencil3DGeometry(
  params: EyebrowCustomParams,
  biometrics: BiometricMeasurements
): { stencilMesh: THREE.BufferGeometry; moldMesh: THREE.BufferGeometry } {
  
  // ── DIMENSIONS (in mm, real-world scale) ──
  const frameWidth = 70;  // Total width
  const frameHeight = 40; // Total height
  const frameDepth = params.stencilThicknessMm || 2.5;
  const handleLength = 35;
  const handleWidth = 12;
  const handleHeight = 8;

  // ── OUTER FRAME SHAPE ──
  const shape = new THREE.Shape();
  const radius = 6;
  const x = -frameWidth / 2;
  const y = -frameHeight / 2;

  // Rounded rectangle path
  shape.moveTo(x + radius, y);
  shape.lineTo(x + frameWidth - radius, y);
  shape.quadraticCurveTo(x + frameWidth, y, x + frameWidth, y + radius);
  shape.lineTo(x + frameWidth, y + frameHeight - radius);
  shape.quadraticCurveTo(x + frameWidth, y + frameHeight, x + frameWidth - radius, y + frameHeight);
  shape.lineTo(x + radius, y + frameHeight);
  shape.quadraticCurveTo(x, y + frameHeight, x, y + frameHeight - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);

  // ── EYEBROW CUTOUT (precise bezier curves based on user params) ──
  const hole = new THREE.Path();
  const len = (params.lengthMm || 52) * 0.6;  // Scale to fit frame
  const arch = (params.archHeightMm || 13.5) * 0.35;
  const thick = (params.thicknessMm || 6.5) * 0.9;
  const tailDrop = (params.tailDropMm || 4.0) * 0.3;

  // Start at eyebrow head (inner corner)
  const startX = -len / 2;
  const startY = 0;

  // Top edge of eyebrow (from head to arch to tail)
  hole.moveTo(startX, startY - thick / 2);
  
  // Head to arch (rising curve)
  hole.bezierCurveTo(
    startX + len * 0.15, startY - thick / 2 - arch * 0.3,
    startX + len * 0.35, startY - thick / 2 - arch * 0.8,
    startX + len * 0.55, startY - thick / 2 - arch
  );
  
  // Arch to tail (descending curve)
  hole.bezierCurveTo(
    startX + len * 0.7, startY - thick / 2 - arch * 0.7,
    startX + len * 0.85, startY - thick / 2 - arch * 0.2 + tailDrop,
    startX + len, startY + tailDrop
  );
  
  // Tail bottom (coming back)
  hole.bezierCurveTo(
    startX + len * 0.85, startY + thick / 2 + tailDrop * 0.5,
    startX + len * 0.65, startY + thick / 2,
    startX + len * 0.45, startY + thick / 2
  );
  
  // Bottom edge back to head
  hole.bezierCurveTo(
    startX + len * 0.25, startY + thick / 2,
    startX + len * 0.1, startY + thick / 2 * 0.8,
    startX, startY + thick / 2
  );
  
  // Close the shape
  hole.bezierCurveTo(
    startX - len * 0.02, startY + thick / 4,
    startX - len * 0.02, startY - thick / 4,
    startX, startY - thick / 2
  );

  shape.holes.push(hole);

  // ── EXTRUDE SETTINGS ──
  const extrudeSettings = {
    steps: 2,
    depth: frameDepth,
    bevelEnabled: true,
    bevelThickness: 0.8,
    bevelSize: 0.8,
    bevelSegments: 3,
  };

  const stencilGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  stencilGeo.center();

  // ── CURVE TO FIT FOREHEAD ──
  const curveRadius = biometrics.foreheadCurvatureRadiusMm || 78;
  const posAttr = stencilGeo.attributes.position;

  for (let i = 0; i < posAttr.count; i++) {
    const px = posAttr.getX(i);
    const absX = Math.min(Math.abs(px), curveRadius - 1);
    const z = -(curveRadius - Math.sqrt(curveRadius * curveRadius - absX * absX)) * 0.2;
    posAttr.setZ(i, posAttr.getZ(i) + z);
  }
  stencilGeo.computeVertexNormals();

  // ── HANDLE (ergonomic grip) ──
  const handleShape = new THREE.Shape();
  const hx = -handleWidth / 2;
  const hy = -handleLength / 2;
  const hr = 3;

  handleShape.moveTo(hx + hr, hy);
  handleShape.lineTo(hx + handleWidth - hr, hy);
  handleShape.quadraticCurveTo(hx + handleWidth, hy, hx + handleWidth, hy + hr);
  handleShape.lineTo(hx + handleWidth, hy + handleLength - hr);
  handleShape.quadraticCurveTo(hx + handleWidth, hy + handleLength, hx + handleWidth - hr, hy + handleLength);
  handleShape.lineTo(hx + hr, hy + handleLength);
  handleShape.quadraticCurveTo(hx, hy + handleLength, hx, hy + handleLength - hr);
  handleShape.lineTo(hx, hy + hr);
  handleShape.quadraticCurveTo(hx, hy, hx + hr, hy);

  const handleExtrudeSettings = {
    steps: 1,
    depth: handleHeight,
    bevelEnabled: true,
    bevelThickness: 1.5,
    bevelSize: 1.5,
    bevelSegments: 4,
  };

  const handleGeo = new THREE.ExtrudeGeometry(handleShape, handleExtrudeSettings);
  handleGeo.center();

  // Position handle below the stencil
  const handlePosAttr = handleGeo.attributes.position;
  for (let i = 0; i < handlePosAttr.count; i++) {
    handlePosAttr.setY(i, handlePosAttr.getY(i) - frameHeight / 2 - handleLength / 2 + 2);
    handlePosAttr.setZ(i, handlePosAttr.getZ(i) + handleHeight / 2);
  }
  handleGeo.computeVertexNormals();

  // ── MERGE GEOMETRIES ──
  const mergedGeo = mergeBufferGeometries([stencilGeo, handleGeo]);

  // ── MOLD CAVITY (for silicone casting) ──
  const moldWidth = frameWidth + 15;
  const moldHeight = frameHeight + handleLength + 15;
  const moldDepth = (params.moldDepthMm || 4.0) + frameDepth + 2;

  const moldShape = new THREE.Shape();
  const mx = -moldWidth / 2;
  const my = -moldHeight / 2;
  const mr = 8;

  moldShape.moveTo(mx + mr, my);
  moldShape.lineTo(mx + moldWidth - mr, my);
  moldShape.quadraticCurveTo(mx + moldWidth, my, mx + moldWidth, my + mr);
  moldShape.lineTo(mx + moldWidth, my + moldHeight - mr);
  moldShape.quadraticCurveTo(mx + moldWidth, my + moldHeight, mx + moldWidth - mr, my + moldHeight);
  moldShape.lineTo(mx + mr, my + moldHeight);
  moldShape.quadraticCurveTo(mx, my + moldHeight, mx, my + moldHeight - mr);
  moldShape.lineTo(mx, my + mr);
  moldShape.quadraticCurveTo(mx, my, mx + mr, my);

  const moldExtrudeSettings = {
    steps: 1,
    depth: moldDepth,
    bevelEnabled: true,
    bevelThickness: 2,
    bevelSize: 2,
    bevelSegments: 3,
  };

  const moldGeo = new THREE.ExtrudeGeometry(moldShape, moldExtrudeSettings);
  moldGeo.center();

  // Position mold behind the stencil
  const moldPosAttr = moldGeo.attributes.position;
  for (let i = 0; i < moldPosAttr.count; i++) {
    moldPosAttr.setZ(i, moldPosAttr.getZ(i) - moldDepth - frameDepth);
  }
  moldGeo.computeVertexNormals();

  return {
    stencilMesh: mergedGeo,
    moldMesh: moldGeo,
  };
}

/**
 * Merge multiple BufferGeometries into one
 */
function mergeBufferGeometries(geometries: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const merged = new THREE.BufferGeometry();
  
  let totalVertices = 0;
  let totalIndices = 0;
  
  geometries.forEach(geo => {
    totalVertices += geo.attributes.position.count;
    if (geo.index) {
      totalIndices += geo.index.count;
    }
  });
  
  const positions = new Float32Array(totalVertices * 3);
  const normals = new Float32Array(totalVertices * 3);
  const indices = new Uint32Array(totalIndices);
  
  let vertexOffset = 0;
  let indexOffset = 0;
  let vertexCount = 0;
  
  geometries.forEach(geo => {
    const posAttr = geo.attributes.position;
    const normAttr = geo.attributes.normal;
    
    for (let i = 0; i < posAttr.count; i++) {
      positions[(vertexOffset + i) * 3] = posAttr.getX(i);
      positions[(vertexOffset + i) * 3 + 1] = posAttr.getY(i);
      positions[(vertexOffset + i) * 3 + 2] = posAttr.getZ(i);
      
      if (normAttr) {
        normals[(vertexOffset + i) * 3] = normAttr.getX(i);
        normals[(vertexOffset + i) * 3 + 1] = normAttr.getY(i);
        normals[(vertexOffset + i) * 3 + 2] = normAttr.getZ(i);
      }
    }
    
    if (geo.index) {
      for (let i = 0; i < geo.index.count; i++) {
        indices[indexOffset + i] = geo.index.getX(i) + vertexCount;
      }
      indexOffset += geo.index.count;
    }
    
    vertexCount += posAttr.count;
    vertexOffset += posAttr.count;
  });
  
  merged.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  merged.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  merged.setIndex(new THREE.BufferAttribute(indices, 1));
  
  return merged;
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

  const headerStr = "ARTISTIQ 3D Eyebrow Stencil & Mold - Personalized";
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
