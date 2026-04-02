import numpy as np

# Path to the targetp1.npy file
FILE_PATH = "D:/projects/academical/synthetic_core_fyp/backend/Research/pre-processing/targetp1.npy"

try:
    data = np.load(FILE_PATH)

    print("=" * 50)
    print("FILE OVERVIEW")
    print("=" * 50)
    print(f"Shape      : {data.shape}  -> ({data.shape[0]} samples, {data.shape[1]} columns)")
    print(f"Dtype      : {data.dtype}  -> unsigned 16-bit integers (pixel coords)")
    print(f"Memory     : {data.nbytes / 1024:.1f} KB")

    print("\n" + "=" * 50)
    print("COLUMN MEANING  (col 0 = X,  col 1 = Y)")
    print("=" * 50)
    x = data[:, 0].astype(np.int32)
    y = data[:, 1].astype(np.int32)

    print(f"  X  ->  min={x.min():5d}  max={x.max():5d}  mean={x.mean():.1f}  std={x.std():.1f}")
    print(f"  Y  ->  min={y.min():5d}  max={y.max():5d}  mean={y.mean():.1f}  std={y.std():.1f}")

    print("\n" + "=" * 50)
    print("SAMPLE ROWS")
    print("=" * 50)
    print("First 10 rows  [x, y]:")
    print(data[:10])
    print("\nLast 5 rows:")
    print(data[-5:])

    print("\n" + "=" * 50)
    print("UNIQUE TARGET POINTS")
    print("=" * 50)
    unique_points = np.unique(data, axis=0)
    print(f"  Total unique (x,y) points: {len(unique_points)}")
    if len(unique_points) <= 30:
        print("  All unique points:")
        for pt in unique_points:
            count = np.sum((data[:, 0] == pt[0]) & (data[:, 1] == pt[1]))
            print(f"    ({pt[0]:4d}, {pt[1]:4d})  -> {count} samples")

    print("\n" + "=" * 50)
    print("COORDINATE DIAGNOSIS")
    print("=" * 50)
    if x.max() > 1:
        print("  >> PIXEL coordinates (values > 1).")
        print(f"     Likely screen/image resolution around {x.max()} x {y.max()}")
    else:
        print("  >> NORMALIZED coordinates (values in [0, 1]).")

except FileNotFoundError:
    print(f"File not found: {FILE_PATH}")
    print("Check that the path is correct and targetp1.npy exists there.")
except Exception as e:
    print(f"Error: {e}")