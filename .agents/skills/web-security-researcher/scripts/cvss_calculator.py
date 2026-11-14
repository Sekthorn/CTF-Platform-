#!/usr/bin/env python3
"""
CVSS v3.1 Base Score Calculator & Vector String Parser
Standard library only (no external dependencies).
"""

import sys
import math
import argparse

METRICS = {
    'AV': {'N': 0.85, 'A': 0.62, 'L': 0.55, 'P': 0.20},
    'AC': {'L': 0.77, 'H': 0.44},
    'PR_U': {'N': 0.85, 'L': 0.62, 'H': 0.27},
    'PR_C': {'N': 0.85, 'L': 0.68, 'H': 0.50},
    'UI': {'N': 0.85, 'R': 0.62},
    'S': {'U': False, 'C': True},
    'C': {'N': 0.0, 'L': 0.22, 'H': 0.56},
    'I': {'N': 0.0, 'L': 0.22, 'H': 0.56},
    'A': {'N': 0.0, 'L': 0.22, 'H': 0.56},
}

def roundup(val: float) -> float:
    int_val = int(round(val * 100000))
    if int_val % 10000 == 0:
        return int_val / 100000.0
    return (int(int_val / 10000) + 1) / 10.0

def calculate_cvss(vector: str) -> dict:
    parts = vector.replace('CVSS:3.1/', '').split('/')
    m = {}
    for part in parts:
        if ':' in part:
            k, v = part.split(':', 1)
            m[k.upper()] = v.upper()

    required = ['AV', 'AC', 'PR', 'UI', 'S', 'C', 'I', 'A']
    for req in required:
        if req not in m:
            raise ValueError(f"Missing required CVSS metric: {req}")

    scope_changed = (m['S'] == 'C')
    av = METRICS['AV'][m['AV']]
    ac = METRICS['AC'][m['AC']]
    pr = METRICS['PR_C' if scope_changed else 'PR_U'][m['PR']]
    ui = METRICS['UI'][m['UI']]

    iss = 1 - ((1 - METRICS['C'][m['C']]) * (1 - METRICS['I'][m['I']]) * (1 - METRICS['A'][m['A']]))

    if scope_changed:
        impact = 7.52 * (iss - 0.029) - 3.25 * math.pow(iss - 0.02, 15)
    else:
        impact = 6.42 * iss

    exploitability = 8.22 * av * ac * pr * ui

    if impact <= 0:
        base_score = 0.0
    elif not scope_changed:
        base_score = roundup(min(impact + exploitability, 10.0))
    else:
        base_score = roundup(min(1.08 * (impact + exploitability), 10.0))

    if base_score == 0.0:
        severity = "None"
    elif base_score <= 3.9:
        severity = "Low"
    elif base_score <= 6.9:
        severity = "Medium"
    elif base_score <= 8.9:
        severity = "High"
    else:
        severity = "Critical"

    return {
        'vector': f"CVSS:3.1/{'/'.join(f'{k}:{v}' for k, v in m.items())}",
        'base_score': base_score,
        'severity': severity,
        'scope_changed': scope_changed,
        'exploitability_subscore': round(exploitability, 2),
        'impact_subscore': round(impact, 2),
    }

def main():
    parser = argparse.ArgumentParser(description="CVSS v3.1 Calculator for Security Research")
    parser.add_argument("vector", help="CVSS v3.1 Vector String (e.g. CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N)")
    args = parser.parse_args()

    try:
        res = calculate_cvss(args.vector)
        print(f"Vector:   {res['vector']}")
        print(f"Score:    {res['base_score']} ({res['severity']})")
        print(f"Subscore: Exploitability={res['exploitability_subscore']}, Impact={res['impact_subscore']}")
    except Exception as e:
        print(f"Error calculating CVSS: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
