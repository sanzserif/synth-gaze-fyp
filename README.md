# Project Synth-Gaze

An AI-powered eye gaze tracking web application that uses an ONNX-optimized EfficientNet-B0 model to predict gaze angles from uploaded photos and render them as a 3D raycast view.

## Architecture

- **Frontend:** Next.js 15 (App Router) with TypeScript + shadcn/ui
- **Backend:** Python FastAPI with ONNX Runtime
- **Deployment:** Vercel (hybrid Next.js + Python)
- **Model:** EfficientNet-B0 with an angle-regression head (outputs theta and phi)

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.10+
- Your exported ONNX model file

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment:**
   ```bash
   python -m venv venv
   venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Add your model file:**
   - Place your ONNX model in `backend/Research/models/`
   - The current backend expects `gaze_model_attempt2_epoch-18-03Apr0342h.onnx`
   - If the filename changes, update `MODEL_PATH` in [backend/main.py](backend/main.py)

5. **Run the backend:**
   ```bash
   python main.py
   ```
   
   Backend will run on `http://localhost:8000`

### Frontend Setup

1. **Navigate to project root:**
   ```bash
   cd ..
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   
   For local development, ensure `.env.local` contains:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   
   Frontend will run on `http://localhost:3000`

### Using the Application

1. Open `http://localhost:3000` in your browser
2. Upload a face photo
3. Wait for the ONNX backend to return the gaze angles
4. View the predicted gaze ray and hit or miss result in the 3D visualization panel

## API Endpoints

### `GET /`
Health check endpoint
```json
{
  "status": "online",
  "model_loaded": true,
  "runtime": "onnxruntime"
}
```

### `GET /health`
Detailed health check
```json
{
  "status": "healthy",
  "model_path": "/path/to/gaze_model.onnx",
  "model_exists": true,
  "model_loaded": true,
  "runtime": "onnxruntime"
}
```

### `POST /predict`
Upload an image file and get a gaze-angle prediction

**Request:** FormData with `file` field

**Response:**
```json
{
   "thetaNormalized": -0.3088,
   "phiNormalized": 0.0933,
   "thetaRadians": -0.1348,
   "phiRadians": 0.0570,
   "thetaDegrees": -7.7210,
   "phiDegrees": 3.2667,
   "vector": {
      "x": 0.0564,
      "y": 0.1341,
      "z": 0.9893
   }
}
```

### `POST /predict/base64`
Send a base64-encoded image and get a gaze-angle prediction

**Request:**
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

**Response:**
```json
{
   "thetaNormalized": -0.3088,
   "phiNormalized": 0.0933,
   "thetaRadians": -0.1348,
   "phiRadians": 0.0570,
   "thetaDegrees": -7.7210,
   "phiDegrees": 3.2667,
   "vector": {
      "x": 0.0564,
      "y": 0.1341,
      "z": 0.9893
   }
}
```

## Model Details

### Architecture
- **Base Model:** EfficientNet-B0 (pretrained on ImageNet)
- **Head:** Dropout → Linear → ReLU → Dropout → Linear → `Tanh()`
- **Input:** 128×128×3 (grayscale eye crop expanded back to RGB)
- **Output:** 2 floats in `[-1, 1]` representing normalized `theta` and `phi`

### Training Configuration
- **Loss Function:** Huber
- **Optimizer:** AdamW (`lr=3e-4`)
- **Epochs:** 18
- **Batch Size:** 64
- **Transfer Learning:** ImageNet pretrained weights

### Training Data
- **Synthetic:** UnityEyes2 eye images
- **Real:** MPIIGaze right-eye crops
- **Combined cap:** 12K synthetic + 12K real for the main training run

### Preprocessing Pipeline
1. Resize → 128×128
2. Grayscale → 3-channel RGB
3. ToTensor [0, 1]
4. Normalize (ImageNet: mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])

## Customization

### Adjust Raycast Geometry

If the virtual hardware geometry changes, update the screen constants in [components/gaze/gaze-visualization.tsx](components/gaze/gaze-visualization.tsx):

```typescript
const SCREEN_DISTANCE = 60
const SCREEN_WIDTH = 50
const SCREEN_HEIGHT = SCREEN_WIDTH / (16 / 9)
```

### Change Color Scheme

Edit CSS variables in `app/globals.css`:

```css
:root {
  --accent-primary: #3b82f6;  /* Blue */
  --accent-secondary: #8b5cf6;  /* Purple */
  /* Change these to your preferred colors */
}
```

## Project Structure

```
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Main page (orchestrator)
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles + shadcn theme
├── components/
│   ├── gaze/                     # Gaze-specific components
│   │   ├── input-panel.tsx       # Upload-only image input
│   │   ├── gaze-visualization.tsx # 3D raycast scene
│   │   ├── debug-panel.tsx       # Network debug overlay
│   │   ├── info-cards.tsx        # Research info masonry
│   │   ├── icons.tsx             # SVG icon components
│   │   ├── types.ts              # Shared TypeScript types
│   │   └── index.ts              # Barrel export
│   └── ui/                       # shadcn/ui primitives
├── backend/
│   ├── main.py                   # FastAPI server (ONNX Runtime)
│   ├── gaze_model.onnx           # ONNX model for deployment
│   ├── gaze_model.pth            # PyTorch model (backup)
│   ├── convert_to_onnx.py        # PyTorch → ONNX conversion
│   ├── requirements.txt          # Python dependencies
│   └── Research/                 # Training notebook & scripts
│       ├── model_atmpt_1.ipynb   # Training notebook (Colab)
│       ├── process_data.py       # Unity data preprocessing
│       ├── process_argaze.py     # ARGaze single-session processing
│       └── process_full_argaze.py # ARGaze full dataset crawler
├── vercel.json                   # Vercel deployment config
└── .vercelignore                 # Deployment exclusions
```

## Troubleshooting

### Backend Issues

**Model not loading:**
- Ensure `gaze_model.onnx` is in `backend/` directory
- Check model architecture matches (ResNet-18 with fc = Linear(512, 2))
- Verify Python version is 3.10+

**Import errors:**
- Activate virtual environment
- Reinstall dependencies: `pip install -r requirements.txt`

### Frontend Issues

**API connection failed:**
- Verify backend is running on port 8000
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Ensure CORS is enabled (already configured in backend)

**Webcam not working:**
- Grant camera permissions in browser
- Use HTTPS or localhost (required by browser security)
- Check browser console for errors

### Deployment Issues

**Vercel function size exceeded:**
- Ensure `.vercelignore` excludes `.pth` and `venv/`
- Backend uses ONNX Runtime (lightweight) instead of PyTorch

**API routes not working on Vercel:**
- Check `vercel.json` configuration
- Ensure `/api/*` routes to Python backend
- Verify backend file is at `backend/main.py`

## License

MIT License - feel free to use this project for your own purposes.

## Acknowledgments

- PyTorch team for the ML framework
- ONNX Runtime for efficient inference
- Next.js and shadcn/ui for the frontend
- FastAPI for the Python API framework

---

Built with ❤️ using ONNX Runtime, FastAPI, Next.js, and shadcn/ui by Nipun Kariyawasam
