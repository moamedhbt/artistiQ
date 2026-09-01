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
  thicknessMm: number; // e.g. 4.0 - 10.0 mm
  lengthMm: number;    // e.g. 40.0 - 65.0 mm
  archHeightMm: number; // e.g. 8.0 - 22.0 mm
  interGapMm: number;   // e.g. 18.0 - 32.0 mm
  tailDropMm: number;   // e.g. 2.0 - 8.0 mm
  microGrooveDensity: number;
  stencilThicknessMm: number;
  moldDepthMm: number;
  
  // Stored original scanned baseline for the tracing overlay ("calque") comparison
  originalThicknessMm?: number;
  originalLengthMm?: number;
  originalArchHeightMm?: number;
  originalInterGapMm?: number;
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
