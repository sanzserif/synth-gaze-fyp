const RIGHT_EYE_IDX = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398]; //mediapipe right eye landmark indices
const OUTPUT_SIZE = 128;
const CROP_PADDING = 0.25;

export interface LandmarkPt {
  x: number;
  y: number;
  z: number;
}

export interface LandmarkerInstance {
  detect(image: HTMLImageElement): { faceLandmarks: LandmarkPt[][] };
}

let cachedLandmarker: LandmarkerInstance | null = null;

export async function initLandmarker(): Promise<LandmarkerInstance> {
  if (cachedLandmarker) return cachedLandmarker;

  const { FaceLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.17/wasm" //google media pipe
  );
  cachedLandmarker = await FaceLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
      delegate: "GPU",
    },
    runningMode: "IMAGE",
    numFaces: 1,
    minFaceDetectionConfidence: 0.5,
  });
  return cachedLandmarker!;
}
/**
 * Crop the right eye from a detected face, producing a square 128×128 grayscale image.
 *
 *  Draw into a 128×128 canvas.
 *  Convert pixels to grayscale in-place.
 */
export function cropRightEye(
  img: HTMLImageElement,
  landmarks: LandmarkPt[],
  canvas: HTMLCanvasElement
): string {
  const W = img.naturalWidth;
  const H = img.naturalHeight;

  const pts = RIGHT_EYE_IDX.map((i) => ({
    x: landmarks[i].x * W,
    y: landmarks[i].y * H,
  }));

  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  const bx = Math.min(...xs);
  const by = Math.min(...ys);
  const bw = Math.max(...xs) - bx;
  const bh = Math.max(...ys) - by;


  const side = Math.min(Math.max(bw, bh) * (1 + CROP_PADDING * 2), W, H);

  const cx = bx + bw / 2;
  const cy = by + bh / 2;

  // Shift origin so the square stays inside the image rather than clamping the size.
  const x0 = Math.max(0, Math.min(cx - side / 2, W - side));
  const y0 = Math.max(0, Math.min(cy - side / 2, H - side));

  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, x0, y0, side, side, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

  const imageData = ctx.getImageData(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
  const d = imageData.data;
  for (let i = 0; i < d.length; i += 4) {
    const g = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    d[i] = d[i + 1] = d[i + 2] = g;
  }
  ctx.putImageData(imageData, 0, 0);

  return canvas.toDataURL("image/jpeg", 0.92);
}
