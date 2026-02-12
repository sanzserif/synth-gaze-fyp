"""
FastAPI backend for Eye Gaze Tracker
Uses ONNX Runtime for inference
"""

import io
import base64
from typing import Dict
from pathlib import Path

import numpy as np
import onnxruntime as ort
from PIL import Image
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Initialize FastAPI app with root_path for Vercel /api/* routing
app = FastAPI(title="Eye Gaze Tracker API", root_path="/api")

# Configure CORS for Vercel frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Model configuration
MODEL_PATH = Path(__file__).parent / "gaze_model.onnx"

# ImageNet normalization constants
MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32).reshape(3, 1, 1)
STD = np.array([0.229, 0.224, 0.225], dtype=np.float32).reshape(3, 1, 1)

# Global model variable
model = None

class Base64ImageRequest(BaseModel):
    """Request model for base64 encoded images"""
    image: str


class PredictionResponse(BaseModel):
    """Response model for gaze predictions"""
    x: float
    y: float


def load_model():
    """Load the ONNX model"""
    global model

    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"Model file not found at {MODEL_PATH}. "
        )

    model = ort.InferenceSession(str(MODEL_PATH))
    print(f"✓ ONNX model loaded successfully from {MODEL_PATH}")


@app.on_event("startup")
async def startup_event():
    """Load model on startup"""
    try:
        load_model()
    except Exception as e:
        print(f"⚠ Warning: Failed to load model: {e}")


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "online",
        "model_loaded": model is not None,
        "runtime": "onnxruntime",
    }


@app.get("/health")
async def health():
    """Detailed health check"""
    return {
        "status": "healthy" if model is not None else "degraded",
        "model_path": str(MODEL_PATH),
        "model_exists": MODEL_PATH.exists(),
        "model_loaded": model is not None,
        "runtime": "onnxruntime",
    }


def preprocess_image(image: Image.Image) -> np.ndarray:
    """
    Preprocess image for model inference using numpy/PIL only
    Pipeline: Resize 64x64 -> Grayscale (3ch) -> ToTensor -> Normalize
    """
    # Resize to 64x64
    image = image.resize((64, 64), Image.Resampling.BILINEAR)

    # Convert to grayscale then back to 3-channel (R=G=B)
    image = image.convert("L").convert("RGB")

    # Convert to numpy array and normalize to [0, 1] (same as ToTensor)
    img_array = np.array(image, dtype=np.float32) / 255.0

    # HWC -> CHW format
    img_array = np.transpose(img_array, (2, 0, 1))

    # Apply ImageNet normalization
    img_array = (img_array - MEAN) / STD

    # Add batch dimension: (1, 3, 64, 64)
    img_array = np.expand_dims(img_array, axis=0)

    return img_array


def predict_gaze(image: Image.Image) -> Dict[str, float]:
    """
    Predict gaze coordinates from image using ONNX Runtime
    """
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    # Preprocess image
    input_tensor = preprocess_image(image)

    # Run inference
    input_name = model.get_inputs()[0].name
    output = model.run(None, {input_name: input_tensor})

    # Extract coordinates
    x, y = output[0][0]

    return {"x": float(x), "y": float(y)}


@app.post("/predict", response_model=PredictionResponse)
async def predict_from_upload(file: UploadFile = File(...)):
    """
    Predict gaze coordinates from uploaded image file (FormData)
    """
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
    """
    Predict gaze coordinates from base64 encoded image
    """
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

# Run the app
if __name__ == "__main__":
    import uvicorn
    #uvicorn used for running the app
    uvicorn.run(app, host="0.0.0.0", port=8000)
