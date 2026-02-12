import json
import os
import glob
import pandas as pd
import numpy as np

# --- CONFIGURATION ---
# CHANGE THIS PATH for each run!
DATA_DIR = r"D:/projects/academical/eyedata_FYP/lookup_database/imgs" 

# Virtual Screen Settings (Fixed for consistency)
VIRTUAL_DISTANCE_MM = 600  
SCREEN_WIDTH_MM = 530      
SCREEN_HEIGHT_MM = 300     

def parse_vector_string(vec_str):
    clean = vec_str.replace('(', '').replace(')', '')
    return np.fromstring(clean, sep=',')

data_list = []

# 1. Find all JSONs
json_path = os.path.join(DATA_DIR, "*.json")
json_files = glob.glob(json_path)
print(f"Processing {len(json_files)} files in {DATA_DIR}...")

for filepath in json_files:
    try:
        with open(filepath, 'r') as f:
            data = json.load(f)
            
        # 2. Get Vector
        look_vec = parse_vector_string(data['eye_details']['look_vec'])
        vx, vy, vz = look_vec[0], look_vec[1], look_vec[2]
        
        # 3. Project to Screen (Math)
        screen_x_mm = vx * (VIRTUAL_DISTANCE_MM / abs(vz))
        screen_y_mm = vy * (VIRTUAL_DISTANCE_MM / abs(vz))
        
        # 4. Normalize (0.0 to 1.0)
        norm_x = (screen_x_mm / SCREEN_WIDTH_MM) + 0.5
        norm_y = 0.5 - (screen_y_mm / SCREEN_HEIGHT_MM)
        
        # Clip to ensure 0-1 range
        norm_x = np.clip(norm_x, 0.0, 1.0)
        norm_y = np.clip(norm_y, 0.0, 1.0)
        
        # Save filename (matching the image)
        img_filename = os.path.basename(filepath).replace('.json', '.jpg')
        data_list.append([img_filename, norm_x, norm_y])
        
    except Exception as e:
        print(f"Skipping {filepath}: {e}")

# 5. Save CSV
# CHANGE THIS FILENAME for the second run!
df = pd.DataFrame(data_list, columns=['filename', 'x_norm', 'y_norm'])
df.to_csv('labels_lookup.csv', index=False) 
print("Done! CSV saved.")