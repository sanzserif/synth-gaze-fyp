import base64
import io
import math
from pathlib import Path
from typing import Dict, Optional

import numpy as np
import onnxruntime as ort
from PIL import Image
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Eye Gaze Tracker API", root_path="/api")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = (
    Path(__file__).parent
    / "Research"
    / "models"
    / "gaze_model_attempt2_epoch-18-03Apr0342h.onnx"
)
MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32).reshape(3, 1, 1)
STD = np.array([0.229, 0.224, 0.225], dtype=np.float32).reshape(3, 1, 1)
THETA_MAX_RAD = math.radians(25)
PHI_MAX_RAD = math.radians(35)
DEFAULT_MODEL_INPUT_SIZE = 128

model: Optional[ort.InferenceSession] = None
model_input_width = DEFAULT_MODEL_INPUT_SIZE
model_input_height = DEFAULT_MODEL_INPUT_SIZE

class Base64ImageRequest(BaseModel):
    image: str


class GazeVectorResponse(BaseModel):
    x: float
    y: float
    z: float


class PredictionResponse(BaseModel):
    thetaNormalized: float
    phiNormalized: float
    thetaRadians: float
    phiRadians: float
    thetaDegrees: float
    phiDegrees: float
    vector: GazeVectorResponse


def load_model():
    global model, model_input_width, model_input_height

    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"Model file not found at {MODEL_PATH}.")

    model = ort.InferenceSession(str(MODEL_PATH))
    input_shape = model.get_inputs()[0].shape
    if len(input_shape) >= 4:
        height = input_shape[2]
        width = input_shape[3]
        if isinstance(height, int):
            model_input_height = height
        if isinstance(width, int):
            model_input_width = width

    print(
        "ONNX model loaded"
        f"{MODEL_PATH} ({model_input_width}x{model_input_height})"
    )


def build_gaze_vector(theta_rad: float, phi_rad: float) -> Dict[str, float]:
    x = math.tan(phi_rad)
    y = -math.tan(theta_rad)
    z = 1.0
    norm = math.sqrt(x * x + y * y + z * z) or 1.0
    return {"x": x / norm, "y": y / norm, "z": z / norm}


@app.on_event("startup")
async def startup_event():
    try:
        load_model()
    except Exception as e:
        print(f"⚠ Warning: Failed to load model: {e}")


@app.get("/")
async def root():
    return {
        "status": "online",
        "model_loaded": model is not None,
        "runtime": "onnxruntime",
        "input_width": model_input_width,
        "input_height": model_input_height,
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy" if model is not None else "degraded",
        "model_path": str(MODEL_PATH),
        "model_exists": MODEL_PATH.exists(),
        "model_loaded": model is not None,
        "runtime": "onnxruntime",
        "input_width": model_input_width,
        "input_height": model_input_height,
        "theta_limit_degrees": math.degrees(THETA_MAX_RAD),
        "phi_limit_degrees": math.degrees(PHI_MAX_RAD),
    }


def preprocess_image(image: Image.Image) -> np.ndarray:
    image = image.resize((model_input_width, model_input_height), Image.Resampling.BILINEAR)
    image = image.convert("L").convert("RGB")
    img_array = np.array(image, dtype=np.float32) / 255.0
    img_array = np.transpose(img_array, (2, 0, 1))
    img_array = (img_array - MEAN) / STD
    img_array = np.expand_dims(img_array, axis=0)
    return img_array


def predict_gaze(image: Image.Image) -> Dict[str, object]:
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    input_tensor = preprocess_image(image)
    input_name = model.get_inputs()[0].name
    output = model.run(None, {input_name: input_tensor})
    theta_n, phi_n = output[0][0]

    theta_normalized = float(np.clip(theta_n, -1.0, 1.0))
    phi_normalized = float(np.clip(phi_n, -1.0, 1.0))
    theta_radians = theta_normalized * THETA_MAX_RAD
    phi_radians = phi_normalized * PHI_MAX_RAD
    vector = build_gaze_vector(theta_radians, phi_radians)

    return {
        "thetaNormalized": theta_normalized,
        "phiNormalized": phi_normalized,
        "thetaRadians": float(theta_radians),
        "phiRadians": float(phi_radians),
        "thetaDegrees": math.degrees(theta_radians),
        "phiDegrees": math.degrees(phi_radians),
        "vector": vector,
    }


@app.post("/predict", response_model=PredictionResponse)
async def predict_from_upload(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))

        if image.mode != 'RGB':
            image = image.convert('RGB')

        return predict_gaze(image)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing image: {str(e)}")


@app.post("/predict/base64", response_model=PredictionResponse)
async def predict_from_base64(request: Base64ImageRequest):
    try:
        image_data = request.image
        if ',' in image_data:
            image_data = image_data.split(',', 1)[1]

        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes))

        if image.mode != 'RGB':
            image = image.convert('RGB')

        return predict_gaze(image)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing base64 image: {str(e)}")

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
