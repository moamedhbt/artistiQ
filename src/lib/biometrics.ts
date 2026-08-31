import { EyebrowStyleOption, EyebrowCustomParams, BiometricMeasurements } from '@/types';

export const EYEBROW_STYLES: EyebrowStyleOption[] = [
  {
    id: 'naturel',
    name: 'Naturel Élégant',
    subtitle: 'Harmonie & Douceur',
    description: 'Ajusté sur l’arcade naturelle avec une courbure très douce, idéal pour un regard quotidien raffiné.',
    baseThicknessMm: 6.5,
    baseArchHeightMm: 12.0,
    baseLengthMm: 52.0,
    curveFactor: 0.15,
    tag: 'Recommandé IA',
  },
  {
    id: 'arque',
    name: 'Arqué Haute Couture',
    subtitle: 'Raffinement & Sophistication',
    description: 'Une arcade nettement définie qui rehausse le regard et structure les traits du visage avec élégance.',
    baseThicknessMm: 7.0,
    baseArchHeightMm: 16.5,
    baseLengthMm: 55.0,
    curveFactor: 0.35,
    tag: 'Haute Couture',
  },
  {
    id: 'bold',
    name: 'Bold Glamour',
    subtitle: 'Affirmé & Densité',
    description: 'Lignes plus denses et affirmation du caractère, idéal pour un maquillage structuré et intense.',
    baseThicknessMm: 8.5,
    baseArchHeightMm: 14.0,
    baseLengthMm: 54.0,
    curveFactor: 0.22,
    tag: 'Tendance 2026',
  },
  {
    id: 'droit',
    name: 'Droit Moderne',
    subtitle: 'Ligne Épurée & Jeunesse',
    description: 'Style contemporain à faible arche, adoucissant les expressions et donnant un effet lissant naturel.',
    baseThicknessMm: 6.8,
    baseArchHeightMm: 9.5,
    baseLengthMm: 50.0,
    curveFactor: 0.08,
    tag: 'Moderne',
  },
  {
    id: 'soft_feather',
    name: 'Micro-Feather Soft',
    subtitle: 'Micro-sculpture Poil à Poil',
    description: 'Conçu avec micro-fentes ultra-précises pour un rendu poil à poil bluffant de naturel.',
    baseThicknessMm: 7.2,
    baseArchHeightMm: 13.5,
    baseLengthMm: 53.0,
    curveFactor: 0.25,
    tag: 'Précision Ultime',
  },
];

export const DEFAULT_BIOMETRICS: BiometricMeasurements = {
  interPupillaryPx: 240,
  scalePxToMm: 0.2625, // 240px * 0.2625 = ~63mm average IPD
  leftEyeWidthMm: 31.5,
  rightEyeWidthMm: 31.2,
  interEyebrowGapMm: 22.5,
  leftEyebrowLengthMm: 52.0,
  rightEyebrowLengthMm: 52.2,
  leftArchHeightMm: 13.5,
  rightArchHeightMm: 13.4,
  templeCurvatureLeftDeg: 14.2,
  templeCurvatureRightDeg: 14.0,
  foreheadCurvatureRadiusMm: 78.5,
  facialSymmetryIndex: 98.4,
  scanTimestamp: new Date().toISOString(),
};

export const DEFAULT_CUSTOM_PARAMS: EyebrowCustomParams = {
  styleId: 'naturel',
  thicknessMm: 6.5,
  lengthMm: 52.0,
  archHeightMm: 13.5,
  interGapMm: 22.5,
  tailDropMm: 4.0,
  microGrooveDensity: 3,
  stencilThicknessMm: 2.0,
  moldDepthMm: 4.0,
};

/**
 * Calculates real-world millimeter dimensions from pixel landmarks
 */
export function calculateBiometricsFromLandmarks(
  pupilLeft: { x: number; y: number },
  pupilRight: { x: number; y: number },
  leftBrowHead: { x: number; y: number },
  leftBrowArch: { x: number; y: number },
  leftBrowTail: { x: number; y: number },
  rightBrowHead: { x: number; y: number },
  rightBrowArch: { x: number; y: number },
  rightBrowTail: { x: number; y: number },
  templeLeftAngle: number = 14,
  templeRightAngle: number = 14
): BiometricMeasurements {
  const dx = pupilRight.x - pupilLeft.x;
  const dy = pupilRight.y - pupilLeft.y;
  const ipdPx = Math.sqrt(dx * dx + dy * dy);
  
  // Average human IPD (Inter-pupillary distance) is ~63mm
  const scale = ipdPx > 0 ? 63.0 / ipdPx : 0.2625;

  const gapPx = Math.abs(rightBrowHead.x - leftBrowHead.x);
  const interGapMm = parseFloat((gapPx * scale).toFixed(1));

  const leftLenPx = Math.hypot(leftBrowArch.x - leftBrowHead.x, leftBrowArch.y - leftBrowHead.y) +
                    Math.hypot(leftBrowTail.x - leftBrowArch.x, leftBrowTail.y - leftBrowArch.y);
  const rightLenPx = Math.hypot(rightBrowArch.x - rightBrowHead.x, rightBrowArch.y - rightBrowHead.y) +
                     Math.hypot(rightBrowTail.x - rightBrowArch.x, rightBrowTail.y - rightBrowArch.y);

  const leftLengthMm = parseFloat((leftLenPx * scale).toFixed(1));
  const rightLengthMm = parseFloat((rightLenPx * scale).toFixed(1));

  const leftArchHeightMm = parseFloat((Math.abs(leftBrowArch.y - leftBrowHead.y) * scale + 10).toFixed(1));
  const rightArchHeightMm = parseFloat((Math.abs(rightBrowArch.y - rightBrowHead.y) * scale + 10).toFixed(1));

  const symmetry = parseFloat((100 - Math.abs(leftLengthMm - rightLengthMm) * 2 - Math.abs(leftArchHeightMm - rightArchHeightMm) * 3).toFixed(1));

  return {
    interPupillaryPx: Math.round(ipdPx),
    scalePxToMm: parseFloat(scale.toFixed(4)),
    leftEyeWidthMm: 31.5,
    rightEyeWidthMm: 31.5,
    interEyebrowGapMm: Math.max(16, Math.min(32, interGapMm)),
    leftEyebrowLengthMm: Math.max(40, Math.min(65, leftLengthMm)),
    rightEyebrowLengthMm: Math.max(40, Math.min(65, rightLengthMm)),
    leftArchHeightMm: Math.max(8, Math.min(22, leftArchHeightMm)),
    rightArchHeightMm: Math.max(8, Math.min(22, rightArchHeightMm)),
    templeCurvatureLeftDeg: parseFloat(templeLeftAngle.toFixed(1)),
    templeCurvatureRightDeg: parseFloat(templeRightAngle.toFixed(1)),
    foreheadCurvatureRadiusMm: 78.5,
    facialSymmetryIndex: Math.max(85, Math.min(99.8, symmetry)),
    scanTimestamp: new Date().toISOString(),
  };
}

/**
 * Generates SVG path definition string for rendering eyebrow stencil cutout
 */
export function generateEyebrowSvgPath(
  params: EyebrowCustomParams,
  side: 'left' | 'right' = 'left',
  widthPx: number = 200,
  heightPx: number = 100
): string {
  const isLeft = side === 'left';
  const scale = widthPx / 80; // 80mm reference width
  
  const len = params.lengthMm * scale;
  const thick = params.thicknessMm * scale;
  const arch = params.archHeightMm * scale * 0.4;
  const tailDrop = params.tailDropMm * scale;

  const startX = isLeft ? 15 : widthPx - 15;
  const dir = isLeft ? 1 : -1;

  const headTopX = startX;
  const headTopY = heightPx / 2 - thick / 2;
  
  const archX = startX + dir * (len * 0.62);
  const archY = heightPx / 2 - thick / 2 - arch;

  const tailX = startX + dir * len;
  const tailY = heightPx / 2 + tailDrop;

  const headBottomX = startX;
  const headBottomY = heightPx / 2 + thick / 2;

  const archBottomX = archX;
  const archBottomY = archY + thick * 0.8;

  // Cubic bezier path representing eyebrow outline
  return `
    M ${headTopX} ${headTopY}
    C ${startX + dir * (len * 0.3)} ${headTopY - arch * 0.5},
      ${archX - dir * (len * 0.1)} ${archY},
      ${archX} ${archY}
    C ${archX + dir * (len * 0.2)} ${archY},
      ${tailX - dir * (len * 0.1)} ${tailY - thick * 0.2},
      ${tailX} ${tailY}
    C ${tailX - dir * (len * 0.08)} ${tailY + thick * 0.1},
      ${archBottomX + dir * (len * 0.15)} ${archBottomY},
      ${archBottomX} ${archBottomY}
    C ${archBottomX - dir * (len * 0.2)} ${archBottomY},
      ${headBottomX + dir * (len * 0.2)} ${headBottomY},
      ${headBottomX} ${headBottomY}
    Z
  `.replace(/\s+/g, ' ').trim();
}
