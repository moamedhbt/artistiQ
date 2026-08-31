export type EyebrowStyleId = 'naturel' | 'arque' | 'bold' | 'droit' | 'soft_feather';

export interface EyebrowStyleOption {
  id: EyebrowStyleId;
  name: string;
  subtitle: string;
  description: string;
  baseThicknessMm: number;
  baseArchHeightMm: number;
  baseLengthMm: number;
  curveFactor: number;
  tag: string;
}

export interface BiometricMeasurements {
  interPupillaryPx: number;
  scalePxToMm: number; // e.g. 1px = 0.264mm based on average IPD ~63mm
  leftEyeWidthMm: number;
  rightEyeWidthMm: number;
  interEyebrowGapMm: number;
  leftEyebrowLengthMm: number;
  rightEyebrowLengthMm: number;
  leftArchHeightMm: number;
  rightArchHeightMm: number;
  templeCurvatureLeftDeg: number;
  templeCurvatureRightDeg: number;
  foreheadCurvatureRadiusMm: number;
  facialSymmetryIndex: number; // 0 to 100%
  scanTimestamp: string;
}

export interface EyebrowCustomParams {
  styleId: EyebrowStyleId;
  thicknessMm: number; // e.g., 4.0 - 10.0 mm
  lengthMm: number; // e.g., 40.0 - 65.0 mm
  archHeightMm: number; // e.g., 8.0 - 22.0 mm
  interGapMm: number; // e.g., 18.0 - 32.0 mm
  tailDropMm: number; // e.g., 2.0 - 8.0 mm
  microGrooveDensity: number; // 1 to 5 (density of hair texture channels)
  stencilThicknessMm: number; // 1.5 - 2.5 mm base plastic thickness
  moldDepthMm: number; // 3.0 - 5.0 mm depth for silicone resin casting
}

export interface ClientInfo {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  notes?: string;
}

export interface Order {
  id: string;
  createdAt: string;
  clientInfo: ClientInfo;
  biometrics: BiometricMeasurements;
  customParams: EyebrowCustomParams;
  status: 'pending_print' | 'in_molding' | 'quality_check' | 'shipped' | 'delivered';
  scanAngleSnapshots?: {
    front?: string;
    left?: string;
    right?: string;
  };
}
