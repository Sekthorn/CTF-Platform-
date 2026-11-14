#!/usr/bin/env python3
"""
WebSec CTF Dynamic Flag Generator & Validator
Implements deterministic HMAC-SHA256 per-player flags.
Standard library only (no external dependencies).
"""

import sys
import hmac
import hashlib
import argparse

DEFAULT_SECRET = "websec_super_secret_platform_hmac_key_2026"

def generate_flag(challenge_slug: str, player_id: str, secret: str = DEFAULT_SECRET) -> str:
    message = f"{challenge_slug}:{player_id}".encode('utf-8')
    key = secret.encode('utf-8')
    signature = hmac.new(key, message, hashlib.sha256).hexdigest()[:24]
    return f"websec{{{signature}}}"

def verify_flag(submitted_flag: str, challenge_slug: str, player_id: str, secret: str = DEFAULT_SECRET) -> bool:
    expected = generate_flag(challenge_slug, player_id, secret)
    return hmac.compare_digest(submitted_flag.strip(), expected)

def main():
    parser = argparse.ArgumentParser(description="WebSec CTF Dynamic Flag Generator & Validator")
    subparsers = parser.add_subparsers(dest="command", required=True)

    # Generate command
    gen_parser = subparsers.add_parser("generate", help="Generate per-player dynamic flag")
    gen_parser.add_argument("--slug", required=True, help="Challenge slug (e.g. sqli-login-bypass)")
    gen_parser.add_argument("--player-id", required=True, help="Player ID or Username")
    gen_parser.add_argument("--secret", default=DEFAULT_SECRET, help="HMAC secret key")

    # Verify command
    ver_parser = subparsers.add_parser("verify", help="Verify submitted flag")
    ver_parser.add_argument("--flag", required=True, help="Submitted flag (e.g. websec{...})")
    ver_parser.add_argument("--slug", required=True, help="Challenge slug")
    ver_parser.add_argument("--player-id", required=True, help="Player ID or Username")
    ver_parser.add_argument("--secret", default=DEFAULT_SECRET, help="HMAC secret key")

    args = parser.parse_args()

    if args.command == "generate":
        flag = generate_flag(args.slug, args.player_id, args.secret)
        print(f"Generated Flag: {flag}")
    elif args.command == "verify":
        valid = verify_flag(args.flag, args.slug, args.player_id, args.secret)
        if valid:
            print("[+] VALID FLAG: Submission matches authenticated player.")
            sys.exit(0)
        else:
            print("[-] INVALID FLAG: Flag does not match expected player signature.")
            sys.exit(1)

if __name__ == "__main__":
    main()
