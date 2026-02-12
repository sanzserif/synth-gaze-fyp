"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TargetIcon } from "./icons";
import type { GazePrediction } from "./types";

interface GazeVisualizationProps {
  prediction: GazePrediction | null;
}

export function GazeVisualization({ prediction }: GazeVisualizationProps) {
  const getGazePosition = () => {
    if (!prediction) return { left: "50%", top: "50%" };
    const x = Math.max(0, Math.min(1, prediction.x));
    const y = Math.max(0, Math.min(1, prediction.y));
    return { left: `${x * 100}%`, top: `${y * 100}%` };
  };

  return (
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
  );
}
