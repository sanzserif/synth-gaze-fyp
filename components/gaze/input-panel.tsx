"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadIcon, LoaderIcon } from "./icons";

interface InputPanelProps {
  loading: boolean;
  onImageCapture: (imageData: string) => void;
}

export function InputPanel({ loading, onImageCapture }: InputPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

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
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="ml-auto text-xs"
            disabled={loading}
          >
            {loading ? <LoaderIcon /> : <UploadIcon />}
            {loading ? "Analyzing..." : "Choose Photo"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
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
            {loading ? <LoaderIcon /> : <UploadIcon />}
            <p className="text-sm text-muted-foreground mt-3">
              Upload a face photo to estimate gaze
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              JPG, PNG, WebP supported
            </p>
          </div>
          {previewImage ? (
            <div className="rounded-lg overflow-hidden border border-border bg-black/20">
              <img
                src={previewImage}
                alt="Preview"
                className="w-full h-auto max-h-80 object-contain"
              />
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-secondary/20 p-6 text-sm text-muted-foreground">
              The uploaded image is sent once to the ONNX backend. The result is rendered as a 3D raycast view instead of a 2D screen coordinate.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
