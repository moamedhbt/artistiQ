export interface BiometricMeasurements {
  interPupillaryPx: number;
  scalePxToMm: number;
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
  facialSymmetryIndex: number;
  scanTimestamp: string;
}

export interface EyebrowCustomParams {
  styleId: string;
  thicknessMm: number;
  lengthMm: number;
  archHeightMm: number;
  interGapMm: number;
  tailDropMm: number;
  microGrooveDensity: number;
  stencilThicknessMm: number;
  moldDepthMm: number;
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
}
