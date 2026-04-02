"""
Eye Region Cropper — Local Preprocessing
Processes UnityEyes2 and MPIIGaze (Original) images.
Uses ground-truth 2D landmarks from each dataset directly — no MediaPipe needed.

Outputs: cropped 128x128 eye patches + CSV with theta/phi labels.

Usage:
    pip install opencv-python pandas numpy

    # UnityEyes2:
    python crop_eyes.py --source unity --input D:/path/to/unity/imgs --output D:/path/to/output/unity_cropped

    # MPIIGaze (Original format):
    python crop_eyes.py --source mpiigaze --input D:/path/to/MPIIGaze/Data/Original --output D:/path/to/output/mpii_cropped

--- MPIIGaze annotation.txt format (41 columns, no header, no filename) ---
  Cols  0-23  : 2D eye landmark pixel coords in image space (12 x,y pairs)
                 right eye: cols 0-11  (6 points)
                 left  eye: cols 12-23 (6 points)
  Cols 24-25  : on-screen gaze target (pixels) — NOT used
  Cols 26-28  : 3D gaze TARGET position in camera coords (mm)
  Cols 29-34  : head pose (rotation x,y,z + translation x,y,z)
  Cols 35-37  : 3D right eye CENTER in camera coords (mm)
  Cols 38-40  : 3D left  eye CENTER in camera coords (mm)
  Row i (0-indexed) corresponds to image file f"{i+1:04d}.jpg"

  Gaze direction = normalize(target_3d - eye_center_3d)  <- NOT target_3d directly
"""

import os
import cv2
import json
import glob
import argparse
import numpy as np
import pandas as pd
from typing import Optional

CROP_SIZE    = 128   # final output resolution (px)
PADDING_FRAC = 0.20  # padding fraction around eye bounding box
GREY_THRESH  = 0.35  # UnityEyes2: reject frame if >35% is background grey

# ---------------------------------------------------------------------------
# Shared helpers
# ---------------------------------------------------------------------------

def crop_from_points(img: np.ndarray, pts: np.ndarray,
                     padding: float = PADDING_FRAC) -> Optional[np.ndarray]:
    """
    Crop a square region around a set of 2D points (Nx2 array).
    Returns CROP_SIZE x CROP_SIZE image or None if degenerate.
    """
    h, w = img.shape[:2]
    x_min, y_min = pts[:, 0].min(), pts[:, 1].min()
    x_max, y_max = pts[:, 0].max(), pts[:, 1].max()

    bw = x_max - x_min
    bh = y_max - y_min
    pad = max(bw, bh) * padding

    x1 = max(0, int(x_min - pad))
    y1 = max(0, int(y_min - pad))
    x2 = min(w, int(x_max + pad))
    y2 = min(h, int(y_max + pad))

    if x2 - x1 < 8 or y2 - y1 < 8:
        return None

    crop = img[y1:y2, x1:x2].copy()  # copy avoids BORDER_REFLECT crash on edge slices
    ch, cw = crop.shape[:2]

    # For MPIIGaze the image is mostly black — use BORDER_CONSTANT(0) not REFLECT
    # to avoid reflecting the black background into the padding area
    border_mode = cv2.BORDER_REFLECT if cw > 20 and ch > 20 else cv2.BORDER_CONSTANT
    border_val  = 0

    if cw > ch:
        pad_top    = (cw - ch) // 2
        pad_bottom = cw - ch - pad_top
        crop = cv2.copyMakeBorder(crop, pad_top, pad_bottom, 0, 0,
                                  border_mode, value=border_val)
    elif ch > cw:
        pad_left  = (ch - cw) // 2
        pad_right = ch - cw - pad_left
        crop = cv2.copyMakeBorder(crop, 0, 0, pad_left, pad_right,
                                  border_mode, value=border_val)

    return cv2.resize(crop, (CROP_SIZE, CROP_SIZE),
                      interpolation=cv2.INTER_LANCZOS4)


def is_valid_gaze(theta: float, phi: float) -> bool:
    """Accept only gaze angles within realistic screen-use range."""
    return abs(np.degrees(theta)) < 25 and abs(np.degrees(phi)) < 35


def direction_to_theta_phi(dx: float, dy: float, dz: float):
    """Normalize a 3D direction vector and convert to (theta, phi) radians."""
    n = np.sqrt(dx**2 + dy**2 + dz**2)
    if n < 1e-6:
        return None, None
    dx, dy, dz = dx / n, dy / n, dz / n
    # Clamp dy to [-1, 1] before arcsin — floating point normalization can
    # produce values like -1.0000000002 which causes arcsin to return nan
    dy = float(np.clip(dy, -1.0, 1.0))
    theta = float(np.arcsin(-dy))
    phi   = float(np.arctan2(-dx, -dz))
    return theta, phi


def parse_vec_str(vec_str: str) -> np.ndarray:
    """Parse UnityEyes2 vector string '(x, y, z, ...)' to numpy array."""
    clean = vec_str.replace('(', '').replace(')', '')
    return np.array([float(v.strip()) for v in clean.split(',')])


def has_background_bleed(img: np.ndarray, threshold: float = GREY_THRESH) -> bool:
    """Check if UnityEyes2 grey background (≈128,128,128) bleeds into frame."""
    # Cast to int32 BEFORE subtraction to prevent uint8 underflow wrap-around
    img_int = img.astype(np.int32)
    is_grey = (np.abs(img_int - 128) < 12).all(axis=2)
    return float(is_grey.mean()) > threshold


# ---------------------------------------------------------------------------
# UnityEyes2 processor
# Centers crop on iris_2d centroid — always correct regardless of gaze angle.
# Uses interior_margin_2d extent to determine crop size.
# ---------------------------------------------------------------------------

def crop_unity_eye(img: np.ndarray, iris_pts: np.ndarray,
                   margin_pts: np.ndarray) -> Optional[np.ndarray]:
    """
    Crop centered on the iris centroid.
    Clamps strictly to image bounds — no grey padding added.
    Rejects if iris centroid is too close to image edge.
    """
    h, w = img.shape[:2]

    cx = float(iris_pts[:, 0].mean())
    cy = float(iris_pts[:, 1].mean())

    # Reject if iris is within 5% of any image edge
    margin_px = min(w, h) * 0.05
    if cx < margin_px or cx > w - margin_px or cy < margin_px or cy > h - margin_px:
        return None

    bw = margin_pts[:, 0].max() - margin_pts[:, 0].min()
    bh = margin_pts[:, 1].max() - margin_pts[:, 1].min()
    half = max(bw, bh) * (1.0 + PADDING_FRAC)

    # Clamp to image — no padding, no grey bleed
    x1 = max(0, int(cx - half));  x2 = min(w, int(cx + half))
    y1 = max(0, int(cy - half));  y2 = min(h, int(cy + half))

    if x2 - x1 < 8 or y2 - y1 < 8:
        return None

    # Reject if the crop region itself contains too much Unity grey background
    region = cv2.cvtColor(img[y1:y2, x1:x2], cv2.COLOR_BGR2RGB)
    if has_background_bleed(region, threshold=0.12):
        return None

    crop = img[y1:y2, x1:x2].copy()

    # Make square by replicating the edge pixel — avoids mirroring iris content
    ch, cw = crop.shape[:2]
    if cw > ch:
        pad_top    = (cw - ch) // 2
        pad_bottom = cw - ch - pad_top
        crop = cv2.copyMakeBorder(crop, pad_top, pad_bottom, 0, 0,
                                  cv2.BORDER_REPLICATE)
    elif ch > cw:
        pad_left  = (ch - cw) // 2
        pad_right = ch - cw - pad_left
        crop = cv2.copyMakeBorder(crop, 0, 0, pad_left, pad_right,
                                  cv2.BORDER_REPLICATE)

    return cv2.resize(crop, (CROP_SIZE, CROP_SIZE),
                      interpolation=cv2.INTER_LANCZOS4)


def process_unity(input_dir: str, output_dir: str, limit: int = 0):
    os.makedirs(output_dir, exist_ok=True)
    records = []
    skipped_gaze = skipped_grey = skipped_lm = skipped_file = 0

    json_files = sorted(glob.glob(os.path.join(input_dir, "*.json")))
    if limit > 0:
        json_files = json_files[:limit]
    print(f"[Unity] Processing {len(json_files)} JSON files in {input_dir}")

    for i, json_path in enumerate(json_files):
        if i % 500 == 0:
            print(f"  {i}/{len(json_files)}  kept={len(records)}  "
                  f"skip_gaze={skipped_gaze}  skip_grey={skipped_grey}  "
                  f"skip_lm={skipped_lm}")

        # --- Load JSON label ---
        try:
            with open(json_path) as f:
                data = json.load(f)
            vec  = parse_vec_str(data['eye_details']['look_vec'])
            theta, phi = direction_to_theta_phi(vec[0], vec[1], vec[2])
        except Exception:
            skipped_file += 1
            continue

        if theta is None or not is_valid_gaze(theta, phi):
            skipped_gaze += 1
            continue

        # --- Find matching image ---
        base     = os.path.splitext(os.path.basename(json_path))[0]
        img_path = os.path.join(input_dir, f"{base}_cam0.jpg")
        if not os.path.exists(img_path):
            img_path = os.path.join(input_dir, f"{base}_webcam.jpg")
        if not os.path.exists(img_path):
            skipped_file += 1
            continue

        img = cv2.imread(img_path)
        if img is None:
            skipped_file += 1
            continue

        # --- Background bleed check ---
        if has_background_bleed(cv2.cvtColor(img, cv2.COLOR_BGR2RGB)):
            skipped_grey += 1
            continue

        # --- Extract iris_2d (crop center) and interior_margin_2d (crop size) ---
        try:
            cam0 = data['cameras']['cam0']
            iris_pts = np.array([
                parse_vec_str(p)[:2]
                for p in cam0['iris_2d']
            ])
            margin_pts = np.array([
                parse_vec_str(p)[:2]
                for p in cam0['interior_margin_2d']
            ])
        except Exception:
            skipped_lm += 1
            continue

        if len(iris_pts) < 4 or len(margin_pts) < 4:
            skipped_lm += 1
            continue

        crop = crop_unity_eye(img, iris_pts, margin_pts)
        if crop is None:
            skipped_lm += 1
            continue

        out_name = f"unity_{base}.jpg"
        out_path = os.path.join(output_dir, out_name)
        cv2.imwrite(out_path, crop, [cv2.IMWRITE_JPEG_QUALITY, 95])

        records.append({
            'filepath': out_path,
            'theta':    theta,
            'phi':      phi,
            'source':   'unity',
            'side':     'right'   # UnityEyes2 renders one eye
        })

    df = pd.DataFrame(records)
    csv_path = os.path.join(output_dir, "unity_labels.csv")
    df.to_csv(csv_path, index=False)
    print(f"\n[Unity] Done. Kept={len(records)}/{len(json_files)}")
    print(f"  skip_gaze={skipped_gaze}  skip_grey={skipped_grey}  "
          f"skip_landmarks={skipped_lm}  skip_file={skipped_file}")
    print(f"  CSV: {csv_path}")
    return df


# ---------------------------------------------------------------------------
# MPIIGaze processor (Original format)
#
# KEY FACTS discovered from inspecting the actual dataset:
#   - Images are 1280x720, mostly black — eye strip pasted on black bg
#   - annotation.txt has 41 columns, NO filename column, NO header
#   - Row i (0-indexed) → image file f"{i+1:04d}.jpg"
#   - Cols 26-28 = 3D gaze TARGET position (mm in camera space) — NOT a direction
#   - Cols 35-37 = 3D right eye center (mm in camera space)
#   - Cols 38-40 = 3D left  eye center (mm in camera space)
#   - Gaze direction = normalize(target - eye_center)  ← correct formula
#   - Cols 0-11  = right eye 2D landmark pixels (6 x,y pairs)
#   - Cols 12-23 = left  eye 2D landmark pixels (6 x,y pairs)
# ---------------------------------------------------------------------------

def process_mpiigaze(input_dir: str, output_dir: str, limit: int = 0):
    os.makedirs(output_dir, exist_ok=True)
    records = []
    skipped_gaze = skipped_crop = skipped_anno = skipped_file = 0
    kept_total = 0

    participant_dirs = sorted([
        d for d in os.listdir(input_dir)
        if os.path.isdir(os.path.join(input_dir, d)) and d.startswith('p')
    ])
    print(f"[MPIIGaze] Found {len(participant_dirs)} participants")

    for p in participant_dirs:
        if limit > 0 and kept_total >= limit:
            break
        p_dir    = os.path.join(input_dir, p)
        day_dirs = sorted([
            d for d in os.listdir(p_dir)
            if os.path.isdir(os.path.join(p_dir, d)) and d.startswith('day')
        ])

        for day in day_dirs:
            if limit > 0 and kept_total >= limit:
                break
            day_path  = os.path.join(p_dir, day)
            anno_path = os.path.join(day_path, "annotation.txt")
            if not os.path.exists(anno_path):
                continue

            try:
                anno = pd.read_csv(anno_path, sep=' ', header=None)
            except Exception:
                skipped_anno += 1
                continue

            if anno.shape[1] != 41:
                print(f"  WARNING: {anno_path} has {anno.shape[1]} cols, expected 41. Skipping.")
                skipped_anno += 1
                continue

            for row_idx, row in anno.iterrows():
                # Row i (0-indexed) → image "{i+1:04d}.jpg"
                img_name = f"{int(row_idx) + 1:04d}.jpg"
                img_path = os.path.join(day_path, img_name)

                if not os.path.exists(img_path):
                    skipped_file += 1
                    continue

                img = cv2.imread(img_path)
                if img is None:
                    skipped_file += 1
                    continue

                # --- 3D gaze TARGET and eye CENTERS (mm in camera space) ---
                target = np.array([row.iloc[26], row.iloc[27], row.iloc[28]])
                r_eye  = np.array([row.iloc[35], row.iloc[36], row.iloc[37]])
                l_eye  = np.array([row.iloc[38], row.iloc[39], row.iloc[40]])

                # Gaze direction = target position - eye center position
                r_dir = target - r_eye
                l_dir = target - l_eye

                theta_r, phi_r = direction_to_theta_phi(*r_dir)
                theta_l, phi_l = direction_to_theta_phi(*l_dir)

                # --- 2D eye landmarks for cropping ---
                # Right eye: cols 0-11 → 6 (x,y) pairs
                r_pts = row.iloc[0:12].values.reshape(6, 2).astype(float)
                # Left  eye: cols 12-23 → 6 (x,y) pairs
                l_pts = row.iloc[12:24].values.reshape(6, 2).astype(float)

                for side, pts, theta, phi in [
                    ('right', r_pts, theta_r, phi_r),
                    ('left',  l_pts, theta_l, phi_l)
                ]:
                    if theta is None or not is_valid_gaze(theta, phi):
                        skipped_gaze += 1
                        continue

                    crop = crop_from_points(img, pts)
                    if crop is None:
                        skipped_crop += 1
                        continue

                    # Mirror left eye image + negate phi so sign convention
                    # matches right eye and UnityEyes
                    if side == 'left':
                        crop = cv2.flip(crop, 1)
                        phi  = -phi

                    out_name = f"mpii_{p}_{day}_{int(row_idx)+1:04d}_{side}.jpg"
                    out_path = os.path.join(output_dir, out_name)
                    cv2.imwrite(out_path, crop, [cv2.IMWRITE_JPEG_QUALITY, 95])

                    records.append({
                        'filepath':    out_path,
                        'theta':       theta,
                        'phi':         phi,
                        'source':      'mpiigaze',
                        'side':        side,
                        'participant': p
                    })
                    kept_total += 1
                    if limit > 0 and kept_total >= limit:
                        break

            if len(records) % 5000 == 0 and len(records) > 0:
                print(f"  kept={len(records)}  skip_gaze={skipped_gaze}  "
                      f"skip_crop={skipped_crop}")

    df = pd.DataFrame(records)
    csv_path = os.path.join(output_dir, "mpii_labels.csv")
    df.to_csv(csv_path, index=False)
    print(f"\n[MPIIGaze] Done. Kept={len(records)}")
    print(f"  skip_gaze={skipped_gaze}  skip_crop={skipped_crop}  "
          f"skip_anno={skipped_anno}  skip_file={skipped_file}")
    print(f"  CSV: {csv_path}")
    return df


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Eye region cropper")
    parser.add_argument('--source', required=True, choices=['unity', 'mpiigaze'])
    parser.add_argument('--input',  required=True, help="Raw dataset folder")
    parser.add_argument('--output', required=True, help="Output folder for crops + CSV")
    parser.add_argument('--limit',  type=int, default=0,
                        help="Max samples to keep (0 = no limit, for test runs)")
    args = parser.parse_args()

    if args.source == 'unity':
        process_unity(args.input, args.output, args.limit)
    else:
        process_mpiigaze(args.input, args.output, args.limit)
