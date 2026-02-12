"use client";

import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DebugPanel,
  InputPanel,
  GazeVisualization,
  InfoCards,
} from "@/components/gaze";
import { BugIcon } from "@/components/gaze/icons";
import type { GazePrediction, DebugLog } from "@/components/gaze";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export default function Home() {
  const [prediction, setPrediction] = useState<GazePrediction | null>(null);
  const [loading, setLoading] = useState(false);
  const [debugOpen, setDebugOpen] = useState(false);
  const [debugLogs, setDebugLogs] = useState<DebugLog[]>([]);
  const logIdRef = useRef(0);

  const addDebugLog = useCallback((log: Omit<DebugLog, "id">) => {
    setDebugLogs((prev) =>
      [{ ...log, id: ++logIdRef.current }, ...prev].slice(0, 50),
    );
  }, []);

  const handleImageCapture = async (imageData: string) => {
    setLoading(true);
    const start = performance.now();

    try {
      const response = await fetch(`${API_URL}/predict/base64`, {
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
        <DebugPanel logs={debugLogs} onClose={() => setDebugOpen(false)} />
      )}

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        <InputPanel loading={loading} onImageCapture={handleImageCapture} />
        <GazeVisualization prediction={prediction} />
      </div>

      <Separator className="my-8" />

      {/* Information Cards */}
      <section>
        <h2 className="text-3xl tracking-wider mb-6">Research Information</h2>
        <InfoCards />
      </section>
    </main>
  );
}
