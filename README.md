# Eye Gaze Tracker Web Application

An AI-powered eye gaze tracking web application that uses a PyTorch ResNet18 model to predict where a user is looking based on webcam images or uploaded photos.

## Architecture

- **Frontend:** Next.js 14 (App Router) with TypeScript
- **Backend:** Python FastAPI with PyTorch
- **Deployment:** Vercel (hybrid Next.js + Python)
- **Model:** ResNet18 with custom head (outputs X, Y coordinates)

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.10+
- Your trained `gaze_model.pth` file

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
   - Place your `gaze_model.pth` file in the `backend/` directory
   - The model should be a ResNet18 with modified fc layer: `nn.Linear(512, 2)`

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
  "device": "cpu"
}
```

### `GET /health`
Detailed health check
```json
{
  "status": "healthy",
  "model_path": "/path/to/gaze_model.pth",
  "model_exists": true,
  "model_loaded": true,
  "device": "cpu"
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

## Model Requirements

Your `gaze_model.pth` file must:
- Be a ResNet18 architecture
- Have a modified final layer: `fc = nn.Linear(512, 2)`
- Output two float values (X, Y coordinates)
- Accept input images of size 64×64×3
- Be trained with ImageNet normalization

## Customization

### Adjust Visualization Coordinates

If your model outputs coordinates in a different range (e.g., pixel coordinates instead of normalized [0,1]), update the `getGazePosition` function in `app/page.tsx`:

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

## Troubleshooting

### Backend Issues

**Model not loading:**
- Ensure `gaze_model.pth` is in `backend/` directory
- Check model architecture matches (ResNet18 with fc = Linear(512, 2))
- Verify Python version is 3.12

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
- Use ONNX conversion (Option 2)
- Deploy backend separately (Option 3)
- Verify `--extra-index-url` for CPU-only torch

**API routes not working on Vercel:**
- Check `vercel.json` configuration
- Ensure `/api/*` routes to Python backend
- Verify backend file is at `backend/main.py`

## License

MIT License - feel free to use this project for your own purposes.

## Acknowledgments

- PyTorch team for the amazing ML framework
- Next.js team for the excellent React framework
- FastAPI for the blazing-fast Python API framework

---

Built with ❤️ using PyTorch, FastAPI, and Next.js by Nipun Kariyawasam
