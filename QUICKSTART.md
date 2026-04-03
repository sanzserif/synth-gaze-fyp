# Quick Start Guide

## ⚡ Get Started in 3 Steps

### 1️⃣ Add Your Model File
Place your ONNX file in the `backend/Research/models/` directory:
```
backend/Research/models/gaze_model_attempt2_epoch-18-03Apr0342h.onnx
```

> If the filename is different, update `MODEL_PATH` in [backend/main.py](backend/main.py).

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

1. ✅ Upload a face photo
2. ✅ Watch the 3D raycast scene update with the predicted gaze direction
3. ✅ Confirm the screen target changes between hit and miss when angles move out of bounds
4. ✅ Check the pitch and yaw values in the badge and top status cards
5. ✅ Toggle the debug panel to inspect the new API response payload

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
