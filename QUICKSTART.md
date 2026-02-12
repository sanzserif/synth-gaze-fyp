# Quick Start Guide

## ⚡ Get Started in 3 Steps

### 1️⃣ Add Your Model File
Place your `gaze_model.onnx` file in the `backend/` directory:
```
backend/gaze_model.onnx  <-- Put your model here
```

> If you only have `gaze_model.pth`, convert it first:
> ```bash
> cd backend && python convert_to_onnx.py
> ```

### 2️⃣ Setup Backend
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3️⃣ Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
python main.py
```

**Terminal 2 - Frontend:**
```bash
# From project root
cp .env.example .env.local
npm install
npm run dev
```

**Open:** http://localhost:3000

---

## 🎯 What to Test

1. ✅ Click "Upload" → Upload a photo → See prediction
2. ✅ Click "Webcam" mode → Grant permissions → Click "Capture & Analyze"
3. ✅ Watch the red gaze dot appear on the visualization screen
4. ✅ Check the X, Y coordinates in the badge
5. ✅ Toggle the 🐛 debug panel to inspect API requests

---

## 🚀 Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```
---

## 📖 Full Documentation

See [README.md](README.md) for:
- Detailed API documentation
- Model architecture & training details
- Project structure
- Troubleshooting tips
- Customization examples
