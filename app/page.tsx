"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Icons (inline SVGs for zero dependencies)
const UploadIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);
const CameraIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
    <circle cx="12" cy="13" r="3" />
  </svg>
);
const TargetIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);
const BugIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m8 2 1.88 1.88" />
    <path d="M14.12 3.88 16 2" />
    <path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1" />
    <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6" />
    <path d="M12 20v-9" />
    <path d="M6.53 9C4.6 8.8 3 7.1 3 5" />
    <path d="M6 13H2" />
    <path d="M3 21c0-2.1 1.7-3.9 3.8-4" />
    <path d="M20.97 5c0 2.1-1.6 3.8-3.5 4" />
    <path d="M22 13h-4" />
    <path d="M17.2 17c2.1.1 3.8 1.9 3.8 4" />
  </svg>
);
const GithubIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);
const XIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);
const LoaderIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="animate-spin"
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

interface GazePrediction {
  x: number;
  y: number;
}

interface DebugLog {
  id: number;
  timestamp: string;
  method: string;
  url: string;
  status: number | null;
  duration: number;
  request?: string;
  response?: string;
}

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [prediction, setPrediction] = useState<GazePrediction | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"upload" | "webcam">("upload");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [debugOpen, setDebugOpen] = useState(false);
  const [debugLogs, setDebugLogs] = useState<DebugLog[]>([]);
  const logIdRef = useRef(0);

  // Webcam
  useEffect(() => {
    if (mode === "webcam") {
      startWebcam();
    } else {
      stopWebcam();
    }
    return () => {
      stopWebcam();
    };
  }, [mode]);

  const startWebcam = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
    } catch {
      toast.error("Failed to access webcam. Please grant camera permissions.");
    }
  };

  const stopWebcam = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const captureFrame = (): string | null => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return null;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.8);
  };

  const addDebugLog = useCallback((log: Omit<DebugLog, "id">) => {
    setDebugLogs((prev) =>
      [{ ...log, id: ++logIdRef.current }, ...prev].slice(0, 50),
    );
  }, []);

  const sendPrediction = async (imageData: string) => {
    setLoading(true);
    const start = performance.now();
    const url = `${API_URL}/predict/base64`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageData }),
      });

      const duration = Math.round(performance.now() - start);
      const data = await response.json();

      addDebugLog({
        timestamp: new Date().toLocaleTimeString(),
        method: "POST",
        url: "/predict/base64",
        status: response.status,
        duration,
        request: `{ image: "base64...(${Math.round(imageData.length / 1024)}KB)" }`,
        response: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(data.detail || `API error: ${response.status}`);
      }

      setPrediction(data);
      toast.success(`Prediction received (${duration}ms)`);
    } catch (err) {
      const duration = Math.round(performance.now() - start);
      const message =
        err instanceof Error ? err.message : "Failed to get prediction";
      toast.error(message);

      addDebugLog({
        timestamp: new Date().toLocaleTimeString(),
        method: "POST",
        url: "/predict/base64",
        status: null,
        duration,
        request: `{ image: "base64...(${Math.round(imageData.length / 1024)}KB)" }`,
        response: message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCapture = () => {
    const imageData = captureFrame();
    if (!imageData) {
      toast.error("Failed to capture frame");
      return;
    }
    setPreviewImage(imageData);
    sendPrediction(imageData);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      setPreviewImage(imageData);
      sendPrediction(imageData);
    };
    reader.readAsDataURL(file);
  };

  const getGazePosition = () => {
    if (!prediction) return { left: "50%", top: "50%" };
    const x = Math.max(0, Math.min(1, prediction.x));
    const y = Math.max(0, Math.min(1, prediction.y));
    return { left: `${x * 100}%`, top: `${y * 100}%` };
  };

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto relative">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl md:text-5xl tracking-wider">
            Project Synth-Gaze
          </h1>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setDebugOpen(!debugOpen)}
          className="text-muted-foreground hover:text-foreground"
          title="Debug Panel"
        >
          <BugIcon />
        </Button>
      </header>

      {/* Debug Panel */}
      {debugOpen && (
        <Card className="mb-6 border-muted">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle
                className="text-sm font-medium tracking-normal"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Network Debug
              </CardTitle>
              <CardDescription>API request/response log</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDebugOpen(false)}
              className="h-8 w-8"
            >
              <XIcon />
            </Button>
          </CardHeader>
          <CardContent>
            {debugLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No requests yet.</p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {debugLogs.map((log) => (
                  <div
                    key={log.id}
                    className="text-xs font-mono bg-secondary/50 rounded-md p-3"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant={log.status === 200 ? "default" : "destructive"}
                        className="text-[10px] px-1.5 py-0"
                      >
                        {log.status ?? "ERR"}
                      </Badge>
                      <span className="text-muted-foreground">
                        {log.method}
                      </span>
                      <span className="text-foreground">{log.url}</span>
                      <span className="text-muted-foreground ml-auto">
                        {log.duration}ms
                      </span>
                      <span className="text-muted-foreground">
                        {log.timestamp}
                      </span>
                    </div>
                    {log.request && (
                      <div className="text-muted-foreground mt-1">
                        → {log.request}
                      </div>
                    )}
                    {log.response && (
                      <div className="text-foreground/80 mt-0.5">
                        ← {log.response}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Panel */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <CardTitle
                className="text-lg tracking-normal"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Input
              </CardTitle>
              <div className="flex gap-1 ml-auto">
                <Button
                  variant={mode === "upload" ? "default" : "secondary"}
                  size="sm"
                  onClick={() => setMode("upload")}
                  className="text-xs"
                >
                  <UploadIcon />
                  Upload
                </Button>
                <Button
                  variant={mode === "webcam" ? "default" : "secondary"}
                  size="sm"
                  onClick={() => setMode("webcam")}
                  className="text-xs"
                >
                  <CameraIcon />
                  Webcam
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {mode === "upload" ? (
              <div className="space-y-4">
                <div
                  className="border-2 border-dashed border-muted rounded-lg p-8 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <UploadIcon />
                  <p className="text-sm text-muted-foreground mt-3">
                    Click to upload an image
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    JPG, PNG, WebP supported
                  </p>
                </div>
                {previewImage && (
                  <div className="rounded-lg overflow-hidden border border-border">
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="w-full h-auto max-h-64 object-contain bg-black/20"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-lg overflow-hidden border border-border bg-black/20">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full aspect-[4/3] object-cover"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                </div>
                <Button
                  onClick={handleCapture}
                  disabled={loading || !stream}
                  className="w-full"
                >
                  {loading ? <LoaderIcon /> : <CameraIcon />}
                  {loading ? "Analyzing..." : "Capture & Analyze"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gaze Visualization */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <TargetIcon />
              <div>
                <CardTitle
                  className="text-lg tracking-normal"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Gaze Visualization
                </CardTitle>
                <CardDescription>1920 × 1080 screen</CardDescription>
              </div>
              {prediction && (
                <Badge variant="outline" className="ml-auto font-mono text-xs">
                  ({prediction.x.toFixed(4)}, {prediction.y.toFixed(4)})
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative w-full aspect-video bg-secondary/30 rounded-lg border border-border overflow-hidden">
              {prediction ? (
                <div
                  className="gaze-dot absolute w-4 h-4 rounded-full bg-red-500 border-2 border-white -translate-x-1/2 -translate-y-1/2 z-10"
                  style={getGazePosition()}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">
                    Upload an image to see gaze prediction
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-8" />

      {/* Information Cards - Masonry Layout */}
      <section>
        <h2 className="text-3xl tracking-wider mb-6">Research Information</h2>
        <div className="masonry">
          {/* Research Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle
                className="text-sm tracking-normal"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Research
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm font-medium">
                Bi-Directional Coordinates and Eye-Gaze Prediction on Synthetic
                Data-Based Eye Gaze Tracking
              </p>
              <Separator />
              <div className="text-sm text-muted-foreground space-y-1">
                <p>
                  <span className="text-foreground/70">Supervisor:</span> Prof.
                  Prasad Wimalaratne
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Student Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle
                className="text-sm tracking-normal"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Student
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-1.5">
                <p className="font-medium">Nipun Kariyawasam</p>
                <div className="text-muted-foreground space-y-0.5">
                  <p>IIT ID: 20212143</p>
                  <p>UOW ID: w1901979</p>
                </div>
                <Separator />
                <a
                  href="https://github.com/sanzserif"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors pt-1"
                >
                  <GithubIcon />
                  sanzserif
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Technical Specs */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle
                className="text-sm tracking-normal"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Model Architecture
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-1.5">
                <div className="flex justify-between text-muted-foreground">
                  <span>Base Model</span>
                  <span className="text-foreground">ResNet-18</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Head</span>
                  <span className="text-foreground font-mono text-xs">
                    Linear(512, 2)
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Input Size</span>
                  <span className="text-foreground font-mono text-xs">
                    64 × 64 × 3
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Output</span>
                  <span className="text-foreground font-mono text-xs">
                    (X, Y)
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preprocessing Pipeline */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle
                className="text-sm tracking-normal"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Preprocessing Pipeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-1.5 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] shrink-0">
                    1
                  </Badge>
                  <span className="text-muted-foreground">Resize → 64×64</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] shrink-0">
                    2
                  </Badge>
                  <span className="text-muted-foreground">
                    Grayscale → 3ch RGB
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] shrink-0">
                    3
                  </Badge>
                  <span className="text-muted-foreground">ToTensor [0, 1]</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] shrink-0">
                    4
                  </Badge>
                  <span className="text-muted-foreground">
                    Normalize (ImageNet)
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stack */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle
                className="text-sm tracking-normal"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Stack
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="secondary">Next.js</Badge>
                <Badge variant="secondary">TypeScript</Badge>
                <Badge variant="secondary">FastAPI</Badge>
                <Badge variant="secondary">ONNX Runtime</Badge>
                <Badge variant="secondary">ResNet-18</Badge>
                <Badge variant="secondary">Vercel</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Inference Runtime */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle
                className="text-sm tracking-normal"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Runtime
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-1.5">
                <div className="flex justify-between text-muted-foreground">
                  <span>Inference Engine</span>
                  <span className="text-foreground">ONNX Runtime</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Model Size</span>
                  <span className="text-foreground font-mono text-xs">
                    ~94 KB
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Device</span>
                  <span className="text-foreground">CPU</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Normalization</span>
                  <span className="text-foreground font-mono text-xs">
                    ImageNet
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
