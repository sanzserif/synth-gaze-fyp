"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
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

const SCREEN_DISTANCE = 60;
const SCREEN_WIDTH = 50;
const SCREEN_HEIGHT = SCREEN_WIDTH / (16 / 9);
const MISS_DISTANCE = 95;

interface RaycastResult {
  hit: boolean;
  screenPoint: { x: number; y: number; z: number };
  rayEnd: { x: number; y: number; z: number };
}

function computeRaycast(prediction: GazePrediction | null): RaycastResult | null {
  if (!prediction) {
    return null;
  }

  const { x, y, z } = prediction.vector;
  if (z <= 0) {
    return {
      hit: false,
      screenPoint: { x: 0, y: 0, z: SCREEN_DISTANCE },
      rayEnd: { x: x * MISS_DISTANCE, y: y * MISS_DISTANCE, z: z * MISS_DISTANCE },
    };
  }

  const planeScale = SCREEN_DISTANCE / z;
  const screenPoint = {
    x: x * planeScale,
    y: y * planeScale,
    z: SCREEN_DISTANCE,
  };
  const hit =
    Math.abs(screenPoint.x) <= SCREEN_WIDTH / 2 &&
    Math.abs(screenPoint.y) <= SCREEN_HEIGHT / 2;
  const missScale = MISS_DISTANCE / z;

  return {
    hit,
    screenPoint,
    rayEnd: hit
      ? screenPoint
      : {
          x: x * missScale,
          y: y * missScale,
          z: z * missScale,
        },
  };
}

function RayScene({ prediction }: GazeVisualizationProps) {
  const raycast = computeRaycast(prediction);
  const lineEnd = raycast?.rayEnd ?? { x: 0, y: 0, z: SCREEN_DISTANCE * 0.9 };
  const linePoints = new Float32Array([
    0,
    0,
    0,
    lineEnd.x,
    lineEnd.y,
    lineEnd.z,
  ]);

  return (
    <>
      <color attach="background" args={["#0d1017"]} />
      <ambientLight intensity={0.9} />
      <directionalLight position={[30, 38, 16]} intensity={1.6} />
      <OrbitControls
        makeDefault
        target={[0, 0, 0]}
        enablePan={false}
        minDistance={28}
        maxDistance={180}
        minPolarAngle={0.35}
        maxPolarAngle={Math.PI * 0.88}
        rotateSpeed={0.7}
        zoomSpeed={0.8}
      />
      <gridHelper args={[180, 18, "#353d49", "#1d2430"]} position={[0, -14, 36]} />
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[7, 48, 48]} />
        <meshStandardMaterial color="#f7f7f7" metalness={0.08} roughness={0.2} />
      </mesh>
      <group position={[0, 0, SCREEN_DISTANCE]}>
        <mesh>
          <planeGeometry args={[SCREEN_WIDTH, SCREEN_HEIGHT]} />
          <meshBasicMaterial
            color="#b0c8ff"
            transparent
            opacity={0.2}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh>
          <planeGeometry args={[SCREEN_WIDTH, SCREEN_HEIGHT]} />
          <meshBasicMaterial
            color="#d8e4ff"
            transparent
            opacity={0.9}
            wireframe
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
      <line>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePoints, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={raycast?.hit ? "#ff8f8f" : "#ff7373"} />
      </line>
      {raycast && (
        <mesh position={[raycast.screenPoint.x, raycast.screenPoint.y, SCREEN_DISTANCE]}>
          <sphereGeometry args={[1.25, 18, 18]} />
          <meshBasicMaterial
            color={raycast.hit ? "#f5f19f" : "#ff7474"}
            transparent
            opacity={raycast.hit ? 1 : 0.5}
          />
        </mesh>
      )}
    </>
  );
}

export function GazeVisualization({ prediction }: GazeVisualizationProps) {
  const raycast = computeRaycast(prediction);
  const screenLabel = raycast
    ? raycast.hit
      ? `${raycast.screenPoint.x.toFixed(1)}, ${raycast.screenPoint.y.toFixed(1)}`
      : "MISS"
    : "WAITING";

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <TargetIcon />
          <div>
            <CardTitle className="text-lg tracking-normal" style={{ fontFamily: "var(--font-body)" }}>
              3D Gaze Raycasting
            </CardTitle>
            <CardDescription>Upload-only ONNX inference with browser-side raycast</CardDescription>
          </div>
          {prediction && (
            <Badge variant="outline" className="ml-auto font-mono text-xs">
              {prediction.thetaDegrees.toFixed(1)}° pitch / {prediction.phiDegrees.toFixed(1)}° yaw
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 pb-4 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-secondary/20 px-4 py-3 text-xs font-mono">
            <div className="text-muted-foreground uppercase tracking-[0.2em]">Gaze Output</div>
            <div className="mt-1 text-sm text-foreground">
              {prediction
                ? `${prediction.thetaDegrees.toFixed(1)}p, ${prediction.phiDegrees.toFixed(1)}y`
                : "Awaiting image"}
            </div>
          </div>
          <div className="rounded-lg border border-border bg-secondary/20 px-4 py-3 text-xs font-mono">
            <div className="text-muted-foreground uppercase tracking-[0.2em]">Screen Target</div>
            <div className="mt-1 text-sm text-foreground">{screenLabel}</div>
          </div>
          <div className="rounded-lg border border-border bg-secondary/20 px-4 py-3 text-xs font-mono">
            <div className="text-muted-foreground uppercase tracking-[0.2em]">Hardware Setup</div>
            <div className="mt-1 text-sm text-foreground">Dist:{SCREEN_DISTANCE} Width:{SCREEN_WIDTH}</div>
          </div>
        </div>
        {prediction && !raycast?.hit && (
          <p className="pb-4 text-sm text-amber-200">
            Ray misses the screen. The current hardware geometry falls outside the predicted gaze bounds.
          </p>
        )}
        <div className="relative w-full aspect-[4/3] overflow-hidden rounded-lg border border-border bg-[#0d1017]">
          <div className="pointer-events-none absolute left-4 top-4 z-10 rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.2em] text-white/75">
            Drag to orbit
          </div>
          {prediction ? (
            <Canvas camera={{ position: [-62, 26, 102], fov: 35 }} dpr={[1, 1.5]}>
              <RayScene prediction={prediction} />
            </Canvas>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center px-8 text-center">
              <p className="text-sm text-muted-foreground">
                Upload a photo to render the predicted gaze ray against the virtual screen.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
