import numpy as np
import pandas as pd
import os

# --- CONFIGURATION ---
NPY_PATH = "D:/projects/academical/realdata_FYP/osfstorage-archive/P1/P1_S1/target.npy"   # Point to your .npy file
IMAGE_DIR = "D:/projects/academical/realdata_FYP/osfstorage-archive/P1/P1_S1/P1_S1_C1" # Point to where you unzipped the images
OUTPUT_CSV = "labels_real.csv"

# Resolution from ARGaze documentation (Scene Camera)
SCENE_WIDTH = 1280
SCENE_HEIGHT = 720

try:
    # 1. Load Data
    data = np.load(NPY_PATH)
    print(f"Loaded {len(data)} rows from .npy")

    # 2. Get list of image files (sorted to match the order of data)
    # We assume images are named sequentially or we just list them sorted
    image_files = sorted(os.listdir(IMAGE_DIR))
    
    # Safety Check: Do we have the same number of images and data rows?
    # Note: ARGaze readme says some frames are dropped. 
    # If counts don't match, we strictly pair them by index up to the minimum length.
    min_len = min(len(data), len(image_files))
    print(f"Matching {min_len} images to data rows...")

    csv_data = []

    for i in range(min_len):
        # Get Pixel Values
        raw_x = data[i][0]
        raw_y = data[i][1]

        # Normalize (Math)
        norm_x = raw_x / SCENE_WIDTH
        norm_y = raw_y / SCENE_HEIGHT

        # Clip to 0-1 (just in case)
        norm_x = np.clip(norm_x, 0.0, 1.0)
        norm_y = np.clip(norm_y, 0.0, 1.0)

        # Get Filename
        filename = image_files[i]

        csv_data.append([filename, norm_x, norm_y])

    # 3. Save CSV
    df = pd.DataFrame(csv_data, columns=['filename', 'x_norm', 'y_norm'])
    df.to_csv(OUTPUT_CSV, index=False)
    print(f"Success! Saved {OUTPUT_CSV}")

except Exception as e:
    print(f"Error: {e}")