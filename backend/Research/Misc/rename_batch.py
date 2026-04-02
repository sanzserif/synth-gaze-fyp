"""
rename_batch.py  —  Shift UnityEyes2 file numbers by an offset.

Usage:
    python rename_batch.py --dir PATH --offset 16000 [--dry-run]

Example:
    # Preview what would be renamed
    python rename_batch.py --dir "D:/projects/academical/eyedata_FYP/3d/training_data/imgs/imgs" --offset 16000 --dry-run

    # Actually rename
    python rename_batch.py --dir "D:/projects/academical/eyedata_FYP/3d/training_data/imgs/imgs" --offset 16000
"""

import argparse
import os
import re
import sys

# Matches: 1234.json  or  1234_cam0.jpg  (number at start, then . or _)
PATTERN = re.compile(r'^(\d+)(.+)$')


def collect_renames(directory: str, offset: int, max_num: int = None):
    """Return list of (old_path, new_path) sorted highest-number-first
    to avoid collisions when renaming in-place."""
    renames = []
    for name in os.listdir(directory):
        m = PATTERN.match(name)
        if not m:
            continue
        num   = int(m.group(1))
        if max_num is not None and num > max_num:
            continue
        rest  = m.group(2)          # e.g.  ".json"  or  "_cam0.jpg"
        new_name = f"{num + offset}{rest}"
        old_path = os.path.join(directory, name)
        new_path = os.path.join(directory, new_name)
        renames.append((num, old_path, new_path))

    # Sort descending so e.g. 8000→24000 before 7999→23999 — no mid-rename clash
    renames.sort(key=lambda x: x[0], reverse=True)
    return renames


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dir",     required=True, help="Directory containing UnityEyes2 output files")
    parser.add_argument("--offset",  required=True, type=int, help="Number to add to every file's current index")
    parser.add_argument("--max",     type=int, default=None, help="Only rename files whose number is <= this value (e.g. 8000)")
    parser.add_argument("--dry-run", action="store_true", help="Print what would happen without renaming")
    args = parser.parse_args()

    if not os.path.isdir(args.dir):
        print(f"ERROR: directory not found: {args.dir}")
        sys.exit(1)

    renames = collect_renames(args.dir, args.offset, args.max)
    if not renames:
        print("No matching files found.")
        sys.exit(0)

    print(f"Found {len(renames)} files  |  offset={args.offset}  |  dry_run={args.dry_run}")

    conflicts = [new for _, _, new in renames if os.path.exists(new)]
    if conflicts:
        print(f"\nERROR: {len(conflicts)} target name(s) already exist — aborting.")
        for c in conflicts[:10]:
            print(f"  {c}")
        sys.exit(1)

    if args.dry_run:
        for _, old, new in renames[:20]:
            print(f"  {os.path.basename(old)}  →  {os.path.basename(new)}")
        if len(renames) > 20:
            print(f"  ... and {len(renames) - 20} more")
        return

    renamed = 0
    for _, old, new in renames:
        os.rename(old, new)
        renamed += 1
        if renamed % 1000 == 0:
            print(f"  Renamed {renamed}/{len(renames)} ...")

    print(f"Done. Renamed {renamed} files.")


if __name__ == "__main__":
    main()
