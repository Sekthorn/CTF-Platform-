#!/usr/bin/env python3
"""
Frontend JavaScript & CSS Bundle Budget Analyzer
Audits frontend/dist/assets against defined performance thresholds.
Standard library only (no external dependencies).
"""

import os
import sys
import argparse

DEFAULT_BUDGETS = {
    'index': 150 * 1024,          # 150 KB
    'vendor-react': 200 * 1024,   # 200 KB
    'vendor-icons': 50 * 1024,    # 50 KB
    'vendor-net': 80 * 1024,      # 80 KB
    'css': 100 * 1024,            # 100 KB
    'page': 60 * 1024             # 60 KB for any lazy route
}

def analyze_directory(dist_dir: str):
    assets_dir = os.path.join(dist_dir, 'assets')
    if not os.path.exists(assets_dir):
        print(f"[-] ERROR: Directory not found: {assets_dir}. Please run 'npm run build --prefix frontend' first.", file=sys.stderr)
        sys.exit(1)

    print(f"[*] Analyzing Production Bundle Chunks in: {assets_dir}\n")
    print(f"{'Chunk Name':<42} {'Raw Size':<12} {'Budget':<12} {'Status'}")
    print("-" * 75)

    violations = []
    total_js = 0
    total_css = 0

    for file in sorted(os.listdir(assets_dir)):
        filepath = os.path.join(assets_dir, file)
        if not os.path.isfile(filepath):
            continue

        size = os.path.getsize(filepath)
        size_kb = f"{size / 1024:.2f} KB"

        if file.endswith('.css'):
            total_css += size
            budget = DEFAULT_BUDGETS['css']
            budget_str = f"{budget / 1024:.0f} KB"
            is_over = size > budget
            status = "[OVER BUDGET]" if is_over else "[OK]"
            if is_over:
                violations.append((file, size, budget))
            print(f"{file:<42} {size_kb:<12} {budget_str:<12} {status}")
        elif file.endswith('.js'):
            total_js += size
            # Match specific budget or generic page
            budget = DEFAULT_BUDGETS['page']
            for k in ['index', 'vendor-react', 'vendor-icons', 'vendor-net']:
                if file.startswith(k):
                    budget = DEFAULT_BUDGETS[k]
                    break
            budget_str = f"{budget / 1024:.0f} KB"
            is_over = size > budget
            status = "[OVER BUDGET]" if is_over else "[OK]"
            if is_over:
                violations.append((file, size, budget))
            print(f"{file:<42} {size_kb:<12} {budget_str:<12} {status}")

    print("-" * 75)
    print(f"Total JavaScript Assets: {total_js / 1024:.2f} KB")
    print(f"Total Stylesheet Assets: {total_css / 1024:.2f} KB")

    if violations:
        print(f"\n[!] WARNING: {len(violations)} chunk(s) exceeded the defined performance budget.")
        sys.exit(1)
    else:
        print("\n[+] SUCCESS: All chunks within performance budgets.")
        sys.exit(0)

def main():
    parser = argparse.ArgumentParser(description="WebSec CTF Bundle Budget Analyzer")
    parser.add_argument("--dir", default="frontend/dist", help="Path to frontend dist directory")
    args = parser.parse_args()
    analyze_directory(args.dir)

if __name__ == "__main__":
    main()
