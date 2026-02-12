export interface GazePrediction {
  x: number;
  y: number;
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
