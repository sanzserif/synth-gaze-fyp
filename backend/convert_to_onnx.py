"""
Convert PyTorch gaze model (.pth) to ONNX format (.onnx)

Run this script locally before deploying to Vercel:
    python convert_to_onnx.py

Requires PyTorch (install locally, not needed on Vercel):
    pip install torch torchvision
"""

import torch
import torch.nn as nn
from torchvision import models
from pathlib import Path


def convert():
    model_path = Path(__file__).parent / "gaze_model.pth"
    output_path = Path(__file__).parent / "gaze_model.onnx"

    if not model_path.exists():
        print(f"✗ Error: {model_path} not found.")
        print("  Place your gaze_model.pth in this directory first.")
        return

    print(f"Loading model from {model_path}...")

    # Create ResNet18 with modified head
    model = models.resnet18(weights=None)
    model.fc = nn.Linear(512, 2)

    # Load trained weights
    state_dict = torch.load(str(model_path), map_location="cpu")
    model.load_state_dict(state_dict)
    model.eval()

    # Create dummy input matching preprocessing pipeline
    dummy_input = torch.randn(1, 3, 64, 64)

    # Export to ONNX
    print(f"Exporting to {output_path}...")
    torch.onnx.export(
        model,
        dummy_input,
        str(output_path),
        export_params=True,
        opset_version=11,
        input_names=["input"],
        output_names=["output"],
        dynamic_axes={
            "input": {0: "batch_size"},
            "output": {0: "batch_size"},
        },
    )

    # Verify the exported model
    import onnxruntime as ort
    import numpy as np

    session = ort.InferenceSession(str(output_path))
    test_input = np.random.randn(1, 3, 64, 64).astype(np.float32)
    result = session.run(None, {"input": test_input})

    print(f"\n✓ Model converted successfully!")
    print(f"  Output: {output_path}")
    print(f"  Size: {output_path.stat().st_size / 1024 / 1024:.1f} MB")
    print(f"  Test prediction: x={result[0][0][0]:.4f}, y={result[0][0][1]:.4f}")


if __name__ == "__main__":
    convert()
