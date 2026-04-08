"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoaderIcon, UploadIcon } from "./icons";
import { cropRightEye, initLandmarker } from "./eye-crop";

interface InputPanelProps {
  loading: boolean;
  onImageCapture: (imageData: string) => void;
}
type DetectionState = "idle" | "detecting" | "cropped" | "passthrough";

export function InputPanel({ loading, onImageCapture }: InputPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [detectionState, setDetectionState] = useState<DetectionState>("idle");
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  const [readyImage, setReadyImage] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = "";

    setDetectionState("detecting");
    setOriginalPreview(null);
    setReadyImage(null);

    const originalBase64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target!.result as string);
      reader.readAsDataURL(file);
    });

    setOriginalPreview(originalBase64);

    try {
      const landmarker = await initLandmarker();

      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = originalBase64;
      });

      const result = landmarker.detect(img);

      if (result.faceLandmarks && result.faceLandmarks.length > 0) {
        const cropped = cropRightEye(img, result.faceLandmarks[0], canvasRef.current!);
        setReadyImage(cropped);
        setDetectionState("cropped");
      } else {
        setReadyImage(originalBase64);
        setDetectionState("passthrough");
      }
    } catch (err) {
      console.error("Face detection error:", err);
      toast.error("Face detection failed. Sending original image.");
      setReadyImage(originalBase64);
      setDetectionState("passthrough");
    }
  };

  const handleAnalyze = () => {
    if (readyImage) onImageCapture(readyImage);
  };

  // Show cropped image once ready, otherwise the original
  const previewSrc =
    detectionState === "cropped" ? readyImage : originalPreview;

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <CardTitle
            className="text-lg tracking-normal"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Input
          </CardTitle>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="ml-auto text-xs"
            disabled={loading || detectionState === "detecting"}
          >
            {detectionState === "detecting" ? <LoaderIcon /> : <UploadIcon />}
            {detectionState === "detecting" ? "Detecting..." : "Choose Photo"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <canvas ref={canvasRef} className="hidden" />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          {detectionState === "idle" && (
            <div
              className="border-2 border-dashed border-muted rounded-lg p-8 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadIcon />
              <p className="text-sm text-muted-foreground mt-3">
                Upload a face photo to estimate gaze
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Face detected automatically · right eye cropped · JPG, PNG, WebP
              </p>
            </div>
          )}
          {previewSrc && (
            <div className="relative rounded-lg overflow-hidden border border-border bg-black/20">
              <img
                src={previewSrc}
                alt="Preview"
                className="w-full h-auto max-h-80 object-contain"
              />
              {detectionState === "detecting" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <span className="text-sm text-white/90 font-mono tracking-wider">
                    Detecting face…
                  </span>
                </div>
              )}
              {detectionState === "cropped" && (
                <Badge className="absolute top-2 left-2 text-[10px] pointer-events-none">
                  Right eye cropped
                </Badge>
              )}
              {detectionState === "passthrough" && (
                <Badge
                  variant="outline"
                  className="absolute top-2 left-2 text-[10px] pointer-events-none border-amber-400/60 text-amber-300"
                >
                  No face detected and no right eye cropped — Proceed with Caution!
                </Badge>
              )}
            </div>
          )}
          {(detectionState === "cropped" || detectionState === "passthrough") && (
            <Button onClick={handleAnalyze} disabled={loading} className="w-full">
              {loading && <LoaderIcon />}
              {loading ? "Analyzing..." : "Analyze Gaze"}
            </Button>
          )}
          {detectionState === "idle" && (
            <div className="rounded-lg border border-border bg-secondary/20 p-6 text-sm text-muted-foreground">
              Upload a face photo. The right eye will be auto-detected and cropped before sending to the model.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
