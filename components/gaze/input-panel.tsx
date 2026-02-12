"use client";

import { useRef, useState, useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadIcon, CameraIcon, LoaderIcon } from "./icons";

interface InputPanelProps {
  loading: boolean;
  onImageCapture: (imageData: string) => void;
}

export function InputPanel({ loading, onImageCapture }: InputPanelProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [mode, setMode] = useState<"upload" | "webcam">("upload");
  const [previewImage, setPreviewImage] = useState<string | null>(null);

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

  const handleCapture = () => {
    const imageData = captureFrame();
    if (!imageData) {
      toast.error("Failed to capture frame");
      return;
    }
    setPreviewImage(imageData);
    onImageCapture(imageData);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      setPreviewImage(imageData);
      onImageCapture(imageData);
    };
    reader.readAsDataURL(file);
  };

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
                className="w-full aspect-4/3 object-cover"
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
  );
}
