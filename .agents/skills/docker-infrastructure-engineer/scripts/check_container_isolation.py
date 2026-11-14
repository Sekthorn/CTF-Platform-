#!/usr/bin/env python3
"""
Docker & Compose Security Isolation Auditor for WebSec CTF
Audits docker-compose files and Dockerfiles for isolation violations.
Standard library only (re, os, sys).
"""

import os
import re
import sys
import argparse

CRITICAL_RULES = [
    {
        "id": "DOCK-001",
        "title": "Mounting host Docker socket (/var/run/docker.sock)",
        "pattern": re.compile(r'/var/run/docker\.sock'),
        "severity": "CRITICAL",
        "fix": "Remove the Docker socket mount. Challenge containers must never control host Docker."
    },
    {
        "id": "DOCK-002",
        "title": "Privileged container mode enabled",
        "pattern": re.compile(r'privileged:\s*true', re.IGNORECASE),
        "severity": "CRITICAL",
        "fix": "Set privileged: false. Use fine-grained cap_add only if strictly required."
    },
    {
        "id": "DOCK-003",
        "title": "Host network mode enabled",
        "pattern": re.compile(r'network_mode:\s*["\']?host["\']?', re.IGNORECASE),
        "severity": "HIGH",
        "fix": "Use dedicated isolated bridge networks (e.g. challenge-sandbox)."
    },
    {
        "id": "DOCK-004",
        "title": "Missing memory or CPU resource limits",
        "pattern_anti": re.compile(r'mem_limit|memory:|cpus:', re.IGNORECASE),
        "severity": "MEDIUM",
        "fix": "Add deploy.resources.limits or mem_limit to prevent local Denial-of-Service."
    }
]

def audit_compose_file(filepath: str) -> list:
    violations = []
    if not os.path.exists(filepath):
        return violations

    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    for rule in CRITICAL_RULES:
        if "pattern" in rule and rule["pattern"].search(content):
            violations.append(rule)
        elif "pattern_anti" in rule and not rule["pattern_anti"].search(content):
            violations.append(rule)

    return violations

def main():
    parser = argparse.ArgumentParser(description="Docker Compose Security Isolation Auditor")
    parser.add_argument("file", nargs="?", default="docker-compose.yml", help="Path to docker-compose file")
    args = parser.parse_args()

    violations = audit_compose_file(args.file)

    if not violations:
        print(f"[+] SUCCESS: {args.file} passed container isolation audit.")
        sys.exit(0)

    print(f"[!] WARNING: Found {len(violations)} isolation issue(s) in {args.file}:\n")
    for v in violations:
        print(f"[{v['severity']}] {v['id']}: {v['title']}")
        print(f"  Fix: {v['fix']}\n")

    sys.exit(1 if any(v['severity'] == 'CRITICAL' for v in violations) else 0)

if __name__ == "__main__":
    main()
