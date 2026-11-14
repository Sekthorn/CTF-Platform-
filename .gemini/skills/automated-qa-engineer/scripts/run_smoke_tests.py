#!/usr/bin/env python3
"""
Automated Smoke & Contract Test Runner for WebSec CTF
Standard library only (urllib.request, json).
"""

import sys
import json
import urllib.request
import urllib.error
import argparse

def test_endpoint(base_url: str, path: str, method: str = "GET", payload: dict = None, expected_status: int = 200) -> dict:
    url = f"{base_url.rstrip('/')}{path}"
    headers = {"Content-Type": "application/json", "Accept": "application/json"}
    data = json.dumps(payload).encode('utf-8') if payload else None

    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            status = response.getcode()
            body = response.read().decode('utf-8')
            return {
                "path": path,
                "status": status,
                "passed": (status == expected_status),
                "error": None,
                "data": json.loads(body) if body else {}
            }
    except urllib.error.HTTPError as e:
        status = e.code
        body = e.read().decode('utf-8', errors='ignore')
        return {
            "path": path,
            "status": status,
            "passed": (status == expected_status),
            "error": f"HTTP {status}",
            "data": json.loads(body) if body.startswith('{') else body
        }
    except Exception as e:
        return {
            "path": path,
            "status": 0,
            "passed": False,
            "error": str(e),
            "data": None
        }

def run_smoke_suite(base_url: str):
    print(f"[*] Running WebSec CTF Automated Smoke Test Suite against: {base_url}\n")
    
    tests = [
        {"name": "Setup Status Check", "path": "/api/auth/setup-status", "method": "GET", "expected": 200},
        {"name": "Challenges Public List", "path": "/api/challenges", "method": "GET", "expected": 200},
        {"name": "Leaderboard Public Summary", "path": "/api/leaderboard", "method": "GET", "expected": 200},
        {"name": "Invalid Login Rejection", "path": "/api/auth/login", "method": "POST", "payload": {"identifier": "nonexistent_operator", "password": "wrong_password123"}, "expected": 401},
        {"name": "Unauthenticated Flag Submission Block", "path": "/api/challenges/test-challenge/submit", "method": "POST", "payload": {"flag": "websec{fake_flag}"}, "expected": 401},
    ]

    results = []
    for t in tests:
        res = test_endpoint(base_url, t["path"], method=t.get("method", "GET"), payload=t.get("payload"), expected_status=t["expected"])
        status_label = "[PASS]" if res["passed"] else "[FAIL]"
        print(f"{status_label} {t['name']} ({t['path']}) -> Received {res['status']}, Expected {t['expected']}")
        if not res["passed"] and res["error"]:
            print(f"       Details: {res['error']}")
        results.append(res)

    passed_count = sum(1 for r in results if r["passed"])
    total_count = len(results)
    print(f"\n[*] Summary: {passed_count}/{total_count} tests passed.")
    return passed_count == total_count

def main():
    parser = argparse.ArgumentParser(description="WebSec CTF Smoke Test Runner")
    parser.add_argument("--url", default="http://localhost:3000", help="Base URL of backend (default: http://localhost:3000)")
    args = parser.parse_args()

    success = run_smoke_suite(args.url)
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
