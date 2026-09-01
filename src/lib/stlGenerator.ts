import { EyebrowCustomParams, BiometricMeasurements } from '@/types';
import * as THREE from 'three';

/**
 * Creates a professional eyebrow mold for silicone casting
 * Uses real biometric measurements for precision
 */
export function createEyebrowStencil3DGeometry(
  params: EyebrowCustomParams,
  biometrics: BiometricMeasurements
): { stencilMesh: THREE.BufferGeometry; moldMesh: THREE.BufferGeometry } {
  
  // ── DIMENSIONS (mm) ──
  const frameW = 75;
  const frameH = 42;
  const frameDepth = params.stencilThicknessMm || 2.5;
  const moldWallThickness = 3;
  const moldBaseThickness = 4;
  const pourChannelWidth = 8;
  const pourChannelHeight = 15;

  // ── 1. STENCIL (the positive - what the client receives) ──
  const stencilShape = createRoundedRect(frameW, frameH, 6);
  
  // Eyebrow window cutout
  const eyebrowWindow = createEyebrowWindow(params);
  stencilShape.holes.push(eyebrowWindow);

  // Nose alignment notch
  const noseNotch = createNoseNotch();
  stencilShape.holes.push(noseNotch);

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
  const moldW = frameW + moldWallThickness * 2;
  const moldH = frameH + moldWallThickness * 2;
  const moldD = moldBaseThickness + frameDepth + 2;

  // Outer mold shape
  const moldShape = createRoundedRect(moldW, moldH, 8);

  // Inner cavity (where the stencil sits)
  const cavityShape = createRoundedRect(frameW - 0.5, frameH - 0.5, 5.5);
  moldShape.holes.push(cavityShape);

  // Eyebrow ridge (creates the window in the stencil)
  const eyebrowRidge = createEyebrowRidge(params);
  moldShape.holes.push(eyebrowRidge);

  const moldGeo = new THREE.ExtrudeGeometry(moldShape, {
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
    moldPos.setZ(i, moldPos.getZ(i) - moldD / 2 - frameDepth / 2 - 2);
  }
  moldGeo.computeVertexNormals();

  // ── 3. POUR CHANNEL ──
  const channelGeo = createPourChannel(pourChannelWidth, pourChannelHeight, moldD);
  
  // Position channel on top of mold
  const channelPos = channelGeo.attributes.position;
  for (let i = 0; i < channelPos.count; i++) {
    channelPos.setY(i, channelPos.getY(i) + moldH / 2 + pourChannelHeight / 2);
    channelPos.setZ(i, channelPos.getZ(i) - moldD / 2 - frameDepth / 2 - 2);
  }
  channelGeo.computeVertexNormals();

  // Merge mold and channel
  const mergedMoldGeo = mergeGeometries([moldGeo, channelGeo]);

  return {
    stencilMesh: stencilGeo,
    moldMesh: mergedMoldGeo,
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
  const len = (params.lengthMm || 52) * 0.55;
  const arch = (params.archHeightMm || 13.5) * 0.3;
  const thick = (params.thicknessMm || 6.5) * 0.85;

  const hole = new THREE.Path();
  
  // Start at eyebrow head
  hole.moveTo(-len / 2, 0);
  
  // Top edge: head → arch → tail
  hole.bezierCurveTo(
    -len / 4, -arch,
    len / 6, -arch * 1.2,
    len / 3, -arch * 0.3
  );
  
  // Tail curve
  hole.bezierCurveTo(
    len / 2.5, thick / 2,
    len / 4, thick / 2,
    0, thick / 3
  );
  
  // Bottom edge: tail → head
  hole.bezierCurveTo(
    -len / 4, thick / 2,
    -len / 3, thick / 3,
    -len / 2, 0
  );

  return hole;
}

/**
 * Creates the eyebrow ridge for the mold (negative of the window)
 */
function createEyebrowRidge(params: EyebrowCustomParams): THREE.Path {
  // Slightly smaller than the window for tolerance
  const len = (params.lengthMm || 52) * 0.52;
  const arch = (params.archHeightMm || 13.5) * 0.28;
  const thick = (params.thicknessMm || 6.5) * 0.8;

  const ridge = new THREE.Path();
  
  ridge.moveTo(-len / 2, 0);
  ridge.bezierCurveTo(
    -len / 4, -arch,
    len / 6, -arch * 1.1,
    len / 3, -arch * 0.25
  );
  ridge.bezierCurveTo(
    len / 2.5, thick / 2,
    len / 4, thick / 2,
    0, thick / 3
  );
  ridge.bezierCurveTo(
    -len / 4, thick / 2,
    -len / 3, thick / 3,
    -len / 2, 0
  );

  return ridge;
}

/**
 * Creates nose alignment notch
 */
function createNoseNotch(): THREE.Path {
  const notch = new THREE.Path();
  const w = 6;
  const h = 4;

  notch.moveTo(-w / 2, 0);
  notch.lineTo(-w / 2, -h);
  notch.lineTo(w / 2, -h);
  notch.lineTo(w / 2, 0);
  notch.lineTo(w / 4, h / 2);
  notch.lineTo(-w / 4, h / 2);
  notch.closePath();

  return notch;
}

/**
 * Creates pour channel for silicone casting
 */
function createPourChannel(width: number, height: number, depth: number): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(-width / 2, 0);
  shape.lineTo(width / 2, 0);
  shape.lineTo(width / 2, height);
  shape.lineTo(-width / 2, height);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    steps: 1,
    depth: depth,
    bevelEnabled: false,
  });

  return geo;
}

/**
 * Applies forehead curvature to geometry
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
 * Merges multiple BufferGeometries
 */
function mergeGeometries(geometries: THREE.BufferGeometry[]): THREE.BufferGeometry {
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
  const hdr = "artistiQ Personalized Eyebrow Mold - 3D Printable";
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
