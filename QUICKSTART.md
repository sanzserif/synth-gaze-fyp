# Quick Start Guide

## ⚡ Get Started in 3 Steps

### 1️⃣ Add Your Model File
Place your `gaze_model.pth` file in the `backend/` directory:
```
backend/gaze_model.pth  <-- Put your model here
```

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
npm run dev
```

**Open:** http://localhost:3000

---

## 🎯 What to Test

1. ✅ Click "Webcam" mode → Grant permissions → Click "Capture & Analyze"
2. ✅ Click "Upload Image" mode → Upload a photo → See prediction
3. ✅ Watch the red gaze dot appear on the visualization screen
4. ✅ Check the X, Y coordinates below the visualization

---

## 🚀 Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

> **Note:** PyTorch may exceed Vercel's 250MB limit. See [README.md](file:///d:/projects/academical/synthetic_core_fyp/README.md) for alternative deployment options (ONNX conversion or separate backend hosting).

---

## 📖 Full Documentation

See [README.md](file:///d:/projects/academical/synthetic_core_fyp/README.md) for:
- Detailed API documentation
- ONNX conversion guide
- Troubleshooting tips
- Customization examples
- Alternative deployment strategies
