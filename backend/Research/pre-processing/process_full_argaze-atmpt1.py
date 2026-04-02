import numpy as np
import pandas as pd
import os

# --- CONFIGURATION ---
# Point this to the PARENT folder containing P1, P2, P3...
ROOT_DIR = r"D:/projects/academical/realdata_FYP/osfstorage-archive" 

# Resolution of the ARGaze Scene Camera
SCENE_WIDTH = 1280
SCENE_HEIGHT = 720

master_data = []

print(f"Starting crawler in: {ROOT_DIR}")

# 1. Walk through every single folder
for root, dirs, files in os.walk(ROOT_DIR):
    # Check if this folder has the "Answer Key" (target.npy)
    if "target.npy" in files:
        npy_path = os.path.join(root, "target.npy")
        
        try:
            # Load the coordinates for this specific session
            targets = np.load(npy_path)
            
            # 2. Look for Image Folders in the same directory
            # We look for folders ending in _C1 (Camera 1) and _C2 (Camera 2)
            # Example: If we are in P1_S1, we look for P1_S1_C1 and P1_S1_C2
            
            # Get current folder name (e.g., P1_S1)
            session_name = os.path.basename(root)
            
            # Construct expected image folder names
            c1_folder_name = f"{session_name}_C1"
            c2_folder_name = f"{session_name}_C2"
            
            c1_path = os.path.join(root, c1_folder_name)
            c2_path = os.path.join(root, c2_folder_name)
            
            # --- PROCESS CAMERA 1 (Left?) ---
            if os.path.exists(c1_path):
                images_c1 = sorted(os.listdir(c1_path))
                # Match images to data rows
                limit = min(len(targets), len(images_c1))
                
                for i in range(limit):
                    # Normalize X, Y
                    nx = np.clip(targets[i][0] / SCENE_WIDTH, 0.0, 1.0)
                    ny = np.clip(targets[i][1] / SCENE_HEIGHT, 0.0, 1.0)
                    
                    # Store: [Full Path to Image, X, Y]
                    # We store full path so the training loader can find it later
                    full_img_path = os.path.join(c1_path, images_c1[i])
                    master_data.append([full_img_path, nx, ny])
                    
            # --- PROCESS CAMERA 2 (Right?) ---
            if os.path.exists(c2_path):
                images_c2 = sorted(os.listdir(c2_path))
                limit = min(len(targets), len(images_c2))
                
                for i in range(limit):
                    nx = np.clip(targets[i][0] / SCENE_WIDTH, 0.0, 1.0)
                    ny = np.clip(targets[i][1] / SCENE_HEIGHT, 0.0, 1.0)
                    
                    full_img_path = os.path.join(c2_path, images_c2[i])
                    master_data.append([full_img_path, nx, ny])
            
            print(f"Processed {session_name}: Added {len(master_data)} total samples so far...")

        except Exception as e:
            print(f"Error processing {root}: {e}")

# 3. Save the Master CSV
print(f"Crawler finished. Total samples collected: {len(master_data)}")
df = pd.DataFrame(master_data, columns=['filepath', 'x_norm', 'y_norm'])

# Save outside the data folders to keep it clean
output_csv = os.path.join(ROOT_DIR, "labels_real_full.csv")
df.to_csv(output_csv, index=False)
print(f"Saved Master CSV to: {output_csv}")