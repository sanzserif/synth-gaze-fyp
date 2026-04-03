export interface GazePrediction {
  thetaNormalized: number;
  phiNormalized: number;
  thetaRadians: number;
  phiRadians: number;
  thetaDegrees: number;
  phiDegrees: number;
  vector: {
    x: number;
    y: number;
    z: number;
  };
}

export interface DebugLog {
  id: number;
  timestamp: string;
  method: string;
  url: string;
  status: number | null;
  duration: number;
  request?: string;
  response?: string;
}
