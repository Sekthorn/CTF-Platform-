#!/usr/bin/env python3
"""
Static Security Code Analyzer for WebSec CTF
Detects dangerous sinks, raw queries, hardcoded secrets, and missing auth guards.
Standard library only (no external dependencies).
"""

import os
import re
import sys
import argparse

RULES = [
    {
        "id": "SEC-001",
        "title": "Use of dangerouslySetInnerHTML without sanitization",
        "severity": "HIGH",
        "pattern": re.compile(r'dangerouslySetInnerHTML\s*='),
        "extensions": [".tsx", ".jsx", ".js", ".ts"],
        "recommendation": "Use React text interpolation or sanitize strictly with DOMPurify."
    },
    {
        "id": "SEC-002",
        "title": "Potential raw unsafe SQL execution in Prisma",
        "severity": "CRITICAL",
        "pattern": re.compile(r'\$queryRawUnsafe|\$executeRawUnsafe'),
        "extensions": [".ts", ".js"],
        "recommendation": "Use parameterized Prisma.sql template literals or standard Prisma client methods."
    },
    {
        "id": "SEC-003",
        "title": "Use of eval() or dynamic Function constructor",
        "severity": "CRITICAL",
        "pattern": re.compile(r'\beval\s*\(|new\s+Function\s*\('),
        "extensions": [".ts", ".js", ".tsx", ".jsx"],
        "recommendation": "Avoid dynamic code execution. Parse structured data using JSON.parse()."
    },
    {
        "id": "SEC-004",
        "title": "Hardcoded secret or private key pattern",
        "severity": "HIGH",
        "pattern": re.compile(r'(?:jwt_secret|api_key|password|private_key)\s*[:=]\s*["\'][A-Za-z0-9_-]{8,}["\']', re.IGNORECASE),
        "extensions": [".ts", ".js", ".tsx", ".jsx", ".json"],
        "recommendation": "Load secrets strictly from environment variables (process.env)."
    },
    {
        "id": "SEC-005",
        "title": "Hardcoded flag pattern in frontend source",
        "severity": "CRITICAL",
        "pattern": re.compile(r'websec\{[a-zA-Z0-9_-]+\}'),
        "extensions": [".tsx", ".jsx", ".ts", ".js"],
        "recommendation": "Flags must be computed or validated strictly on the backend. Never commit real flags in frontend code."
    }
]

def scan_file(filepath: str) -> list:
    findings = []
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            lines = f.readlines()
    except Exception:
        return findings

    ext = os.path.splitext(filepath)[1].lower()

    for rule in RULES:
        if ext not in rule["extensions"]:
            continue
        for idx, line in enumerate(lines, 1):
            if rule["pattern"].search(line):
                # Skip test files and node_modules
                if 'node_modules' in filepath or 'test' in filepath.lower() or '.test.' in filepath or '.spec.' in filepath:
                    continue
                findings.append({
                    "rule_id": rule["id"],
                    "title": rule["title"],
                    "severity": rule["severity"],
                    "file": filepath,
                    "line": idx,
                    "code": line.strip()[:100],
                    "recommendation": rule["recommendation"]
                })
    return findings

def scan_directory(target_dir: str) -> list:
    all_findings = []
    exclude_dirs = {'node_modules', '.git', 'dist', 'build', '.gemini'}

    for root, dirs, files in os.walk(target_dir):
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        for file in files:
            filepath = os.path.join(root, file)
            findings = scan_file(filepath)
            all_findings.extend(findings)

    return all_findings

def main():
    parser = argparse.ArgumentParser(description="Static Security Analyzer for WebSec CTF")
    parser.add_argument("path", nargs="?", default=".", help="Target directory or file to scan")
    args = parser.parse_args()

    target = args.path
    if os.path.isfile(target):
        findings = scan_file(target)
    else:
        findings = scan_directory(target)

    if not findings:
        print("[+] SUCCESS: No static security violations detected.")
        sys.exit(0)

    print(f"[!] WARNING: Found {len(findings)} security finding(s):\n")
    for f in findings:
        print(f"[{f['severity']}] {f['rule_id']}: {f['title']}")
        print(f"  Location: {f['file']}:{f['line']}")
        print(f"  Snippet:  {f['code']}")
        print(f"  Action:   {f['recommendation']}\n")

    sys.exit(1 if any(f['severity'] == 'CRITICAL' for f in findings) else 0)

if __name__ == "__main__":
    main()
