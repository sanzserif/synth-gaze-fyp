# Project Synth-Gaze

An AI-powered eye gaze tracking web application that uses an ONNX-optimized ResNet-18 model to predict where a user is looking based on webcam images or uploaded photos.

## Architecture

- **Frontend:** Next.js 15 (App Router) with TypeScript + shadcn/ui
- **Backend:** Python FastAPI with ONNX Runtime
- **Deployment:** Vercel (hybrid Next.js + Python)
- **Model:** ResNet-18 with custom head (outputs X, Y coordinates)

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.10+
- Your trained `gaze_model.onnx` file (or `gaze_model.pth` for conversion)

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
   - Place your `gaze_model.onnx` file in the `backend/` directory
   - If you only have `gaze_model.pth`, run `python convert_to_onnx.py` to convert it
   - The model should be a ResNet-18 with modified fc layer: `nn.Linear(512, 2)`

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
2. Choose between **Webcam** or **Upload Image** mode
3. Grant camera permissions (for webcam mode)
4. Click **"Capture & Analyze"** or upload an image
5. View the predicted gaze point on the visualization screen

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
Upload an image file and get gaze prediction

**Request:** FormData with `file` field

**Response:**
```json
{
  "x": 0.4521,
  "y": 0.3891
}
```

### `POST /predict/base64`
Send base64-encoded image and get gaze prediction

**Request:**
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

**Response:**
```json
{
  "x": 0.4521,
  "y": 0.3891
}
```

## Model Details

### Architecture
- **Base Model:** ResNet-18 (pretrained on ImageNet)
- **Modified Head:** `fc = nn.Linear(512, 2)` — outputs (X, Y) normalized coordinates
- **Input:** 64×64×3 (RGB)
- **Output:** 2 floats in [0, 1] range representing gaze position

### Training Configuration
- **Loss Function:** MSE (Mean Squared Error)
- **Optimizer:** Adam (lr=0.001)
- **Epochs:** 5
- **Batch Size:** 128
- **Transfer Learning:** ImageNet pretrained weights

### Training Data
- **Synthetic:** Unity-generated eye images (5,000 samples) with gaze vectors projected to screen coordinates
- **Real:** ARGaze dataset (~2.6M samples from multiple participants and camera angles)
- **Combined & capped** at 40,000 samples for training

### Preprocessing Pipeline
1. Resize → 64×64
2. Grayscale → 3-channel RGB
3. ToTensor [0, 1]
4. Normalize (ImageNet: mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])

> **Note:** Unity synthetic data also applies `CenterCrop(300)` before resize during training.

## Customization

### Adjust Visualization Coordinates

If your model outputs coordinates in a different range (e.g., pixel coordinates instead of normalized [0,1]), update the `getGazePosition` function in `components/gaze/gaze-visualization.tsx`:

```typescript
const getGazePosition = () => {
  if (!prediction) return { left: '50%', top: '50%' }
  
  // Example: If model outputs pixel coordinates for 1920x1080
  const normalizedX = prediction.x / 1920
  const normalizedY = prediction.y / 1080
  
  return {
    left: `${normalizedX * 100}%`,
    top: `${normalizedY * 100}%`
  }
}
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
│   │   ├── input-panel.tsx       # Upload/webcam input
│   │   ├── gaze-visualization.tsx # Gaze dot display
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
